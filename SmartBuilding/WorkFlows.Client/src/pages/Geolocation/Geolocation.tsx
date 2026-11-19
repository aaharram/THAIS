import { ExcelFileIcon, PdfFileIcon } from '@/components/icons/file-icons';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { BuildingMapMarkerResponse } from '@/store/features/patrimoine/building-map-marker-schemas';
import { getBuildingMapMarkers } from '@/store/features/patrimoine/buildingMapMarkersSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadGoogleMaps } from '@/utils/maps/loadGoogleMaps';
import { pinIcon, RMA_MAP_STYLE } from '@/utils/maps/mapPresentation';
import { ColumnDef } from '@tanstack/react-table';
import { Building2, ChevronDown, Download, MapPin, Network } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

const EXPORT_HEADER = ['Actif', 'Typologie', 'Adresse', 'Ville'];

// RMANew (Classes/Carte.vb, GetOptions) : centre par défaut sur le Maroc, zoom 5.
const DEFAULT_CENTER = { lat: 28.03715, lng: -9.9998 };
const DEFAULT_ZOOM = 5;

// RMANew (WebForm2.vb, setMarkers -> InfoWindow content) : reconstruit ici via le DOM
// (textContent) plutôt qu'en concaténant une chaîne HTML - les valeurs (désignation,
// adresse...) viennent de la base et ne doivent jamais être interprétées comme du HTML.
const buildInfoWindowContent = (item: BuildingMapMarkerResponse, onDetails: () => void) => {
  const container = document.createElement('div');
  container.className = 'rma-carte-infowindow';
  container.style.minWidth = '180px';
  container.style.fontSize = '13px';

  const title = document.createElement('h4');
  title.style.margin = '0 0 6px 0';
  title.style.fontWeight = '600';
  title.textContent = item.designation;
  container.appendChild(title);

  const addRow = (label: string, value?: string | null) => {
    if (!value) return;
    const row = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = `${label} : `;
    row.appendChild(strong);
    row.appendChild(document.createTextNode(value));
    container.appendChild(row);
  };
  addRow('Adresse', item.address1);
  addRow('Typologie', item.nomBuildingType);
  addRow('Ville', item.nomCity);

  const linkWrap = document.createElement('div');
  linkWrap.style.marginTop = '8px';
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = 'Voir détails';
  link.addEventListener('click', (e) => {
    e.preventDefault();
    onDetails();
  });
  linkWrap.appendChild(link);
  container.appendChild(linkWrap);

  return container;
};

const Geolocation = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const { allItems: buildingTypes } = useAppSelector((state) => state.cfgBuildingTypes);
  const { allItems: markers, loading } = useAppSelector((state) => state.buildingMapMarkers);

  const [noProprietaire, setNoProprietaire] = useState(0);
  const [noBuildingType, setNoBuildingType] = useState(0);
  const [numeroActif, setNumeroActif] = useState(0);
  const [search, setSearch] = useState('');

  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const markerObjectsRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgBuildingTypes.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapsReady(true))
      .catch((error: Error) => setMapsError(error.message));
  }, []);

  // RMANew (Classes/Carte.vb, GetImmeubles) : filtré côté serveur par Réseau et
  // Destinations - le filtre "Actifs" (un building précis) reste côté client (voir
  // visibleMarkers ci-dessous), sur ce même résultat.
  useEffect(() => {
    dispatch(
      getBuildingMapMarkers({
        noProprietaire: noProprietaire || undefined,
        noBuildingType: noBuildingType || undefined,
      }),
    );
  }, [dispatch, noProprietaire, noBuildingType]);

  const visibleMarkers = useMemo(
    () => (numeroActif ? markers.filter((m) => m.numero === numeroActif) : markers),
    [markers, numeroActif],
  );

  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || mapRef.current) return;
    const map = new google.maps.Map(mapDivRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      mapTypeControl: false,
      styles: RMA_MAP_STYLE,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });
    mapRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();

    // Google Maps fige son "viewport" interne sur la taille du conteneur mesurée au tout
    // premier instant de sa création (new google.maps.Map(...)) - si cette mesure est
    // prise avant que la mise en page ne soit tout à fait stabilisée (ex: juste après le
    // montage React), le résultat est une zone grise permanente sur le haut/bas de la
    // carte que ni un vrai changement de taille du conteneur ni un pan/zoom ne corrigent
    // tant que l'évènement 'resize' de l'API n'est pas déclenché manuellement - pattern
    // recommandé par Google pour ce cas précis. On le force ici juste après la création
    // (en réinitialisant le centre, que 'resize' réinitialise à (0,0)), puis à chaque
    // vrai changement de taille du conteneur.
    requestAnimationFrame(() => {
      google.maps.event.trigger(map, 'resize');
      map.setCenter(DEFAULT_CENTER);
    });

    const resizeObserver = new ResizeObserver(() => {
      google.maps.event.trigger(map, 'resize');
    });
    resizeObserver.observe(mapDivRef.current);

    return () => resizeObserver.disconnect();
  }, [mapsReady]);

  const focusMarker = (item: BuildingMapMarkerResponse, marker: google.maps.Marker) => {
    if (!mapRef.current || !infoWindowRef.current) return;
    mapRef.current.panTo({ lat: item.latitude, lng: item.longitude });
    mapRef.current.setZoom(Math.max(mapRef.current.getZoom() ?? DEFAULT_ZOOM, 15));
    // RMANew (Classes/Carte.vb, GetImmeubles -> "url") : le lien pointe vers Immeuble.aspx,
    // la mini-liste à une ligne résumant cet actif (voir pages/Patrimoine/Buildings/Apercu.tsx),
    // pas le formulaire d'édition.
    infoWindowRef.current.setContent(
      buildInfoWindowContent(item, () => navigate(`/patrimoine/actifs/apercu/${item.numero}`)),
    );
    infoWindowRef.current.open(mapRef.current, marker);
  };

  // RMANew (WebForm2.vb, setMarkers) : un marqueur par actif géolocalisé, InfoWindow au
  // clic, fitBounds si plusieurs actifs - sinon zoom serré (RMANew : zoom 20 si un Actif
  // précis est sélectionné, zoom 6 si seulement le Réseau l'est) centré sur l'unique
  // résultat.
  useEffect(() => {
    if (!mapsReady || !mapRef.current) return;

    markerObjectsRef.current.forEach((m) => m.setMap(null));
    markerObjectsRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    visibleMarkers.forEach((item) => {
      const position = { lat: item.latitude, lng: item.longitude };
      const marker = new google.maps.Marker({
        position,
        map: mapRef.current!,
        title: item.address1 ? `${item.designation} - ${item.address1}` : item.designation,
        icon: pinIcon(),
      });
      marker.addListener('click', () => focusMarker(item, marker));
      markerObjectsRef.current.push(marker);
      bounds.extend(position);
    });

    google.maps.event.trigger(mapRef.current, 'resize');

    if (visibleMarkers.length > 1) {
      mapRef.current.fitBounds(bounds);
    } else if (visibleMarkers.length === 1) {
      mapRef.current.panTo({ lat: visibleMarkers[0].latitude, lng: visibleMarkers[0].longitude });
      mapRef.current.setZoom(numeroActif ? 20 : 6);
    } else {
      mapRef.current.panTo(DEFAULT_CENTER);
      mapRef.current.setZoom(DEFAULT_ZOOM);
    }

    // Un pan/zoom manuel fait toujours apparaître les tuiles manquantes - Google
    // recalcule alors correctement les tuiles nécessaires, ce que le seul évènement
    // 'resize' déclenché plus haut ne suffit apparemment pas à provoquer ici. On simule
    // donc la même chose automatiquement : une fois la vue stabilisée ('idle', après le
    // fitBounds/setZoom ci-dessus), un minuscule aller-retour de zoom force le même
    // recalcul de tuiles qu'une interaction manuelle.
    google.maps.event.addListenerOnce(mapRef.current, 'idle', () => {
      const map = mapRef.current;
      if (!map) return;
      const zoom = map.getZoom() ?? DEFAULT_ZOOM;
      map.setZoom(zoom + 1);
      setTimeout(() => map.setZoom(zoom), 150);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady, visibleMarkers, numeroActif]);

  const handleReseauChange = (value: string) => {
    setNoProprietaire(Number(value));
    setNumeroActif(0);
  };

  const handleDestinationChange = (value: string) => {
    setNoBuildingType(Number(value));
    setNumeroActif(0);
  };

  const handleRowClick = (item: BuildingMapMarkerResponse) => {
    const idx = visibleMarkers.findIndex((m) => m.numero === item.numero);
    const marker = markerObjectsRef.current[idx];
    if (marker) {
      focusMarker(item, marker);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // La recherche du tableau (searchableColumns) ne filtre que l'affichage TanStack en
  // interne - recalculée ici en parallèle (mêmes colonnes : Actif/Typologie/Adresse/
  // Ville) pour que l'export Excel/PDF corresponde à ce qui est réellement visible dans
  // la liste, comme partout ailleurs dans l'app où recherche et export restent en phase.
  const searchedMarkers = useMemo(() => {
    if (!search) return visibleMarkers;
    const q = search.toLowerCase();
    return visibleMarkers.filter((m) =>
      [m.designation, m.nomBuildingType, m.address1, m.nomCity].some((v) => (v ?? '').toLowerCase().includes(q)),
    );
  }, [visibleMarkers, search]);

  const exportRows = () =>
    searchedMarkers.map((m) => [m.designation, m.nomBuildingType || '-', m.address1 || '-', m.nomCity || '-']);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Actifs');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 28;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Actifs-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Actifs', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
    });
    doc.save(`Actifs-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<BuildingMapMarkerResponse>[] = [
    {
      accessorKey: 'designation',
      size: 220,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.designation}</div>,
    },
    {
      accessorKey: 'nomBuildingType',
      size: 150,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Typologie' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuildingType || '-'}</div>,
    },
    {
      accessorKey: 'address1',
      size: 260,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Adresse' />,
      cell: ({ row }) => <div className='font-medium truncate'>{row.original.address1 || '-'}</div>,
    },
    {
      accessorKey: 'nomCity',
      size: 150,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ville' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomCity || '-'}</div>,
    },
  ];

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={MapPin} title='Geolocation' description='Localisation des actifs sur la carte' />

          <div className='flex flex-wrap items-end justify-between gap-4'>
            <div className='flex flex-wrap items-end gap-4'>
              <div className='space-y-1'>
                <label className='flex items-center gap-1.5 text-sm font-medium text-muted-foreground'>
                  <Network className='h-3.5 w-3.5' /> Réseau
                </label>
                <Select value={noProprietaire.toString()} onValueChange={handleReseauChange}>
                  <SelectTrigger className='h-9 w-56'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Tous les réseaux</SelectItem>
                    {proprietaires.map((p) => (
                      <SelectItem key={p.numero} value={p.numero.toString()}>
                        {p.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1'>
                <label className='flex items-center gap-1.5 text-sm font-medium text-muted-foreground'>
                  <Building2 className='h-3.5 w-3.5' /> Actifs
                </label>
                <Select value={numeroActif.toString()} onValueChange={(v) => setNumeroActif(Number(v))}>
                  <SelectTrigger className='h-9 w-56'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Tous les Actifs</SelectItem>
                    {markers.map((m) => (
                      <SelectItem key={m.numero} value={m.numero.toString()}>
                        {m.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1'>
                <label className='flex items-center gap-1.5 text-sm font-medium text-muted-foreground'>
                  <MapPin className='h-3.5 w-3.5' /> Destinations
                </label>
                <Select value={noBuildingType.toString()} onValueChange={handleDestinationChange}>
                  <SelectTrigger className='h-9 w-56'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Toutes les destinations</SelectItem>
                    {buildingTypes.map((t) => (
                      <SelectItem key={t.numero} value={t.numero.toString()}>
                        {t.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm font-medium'>
              <Building2 className='h-4 w-4 text-primary' />
              {markers.length} Actifs
            </div>
          </div>

          <div className='rounded-md border'>
            <div className='flex items-center gap-2 border-b bg-white px-4 py-3 font-medium'>
              <MapPin className='h-4 w-4 text-primary' />
              Carte des Actifs
            </div>
            {mapsError ? (
              <div className='flex h-[600px] items-center justify-center text-sm text-muted-foreground'>
                {mapsError}
              </div>
            ) : (
              <div ref={mapDivRef} style={{ width: '100%', height: 600 }} />
            )}
          </div>
        </div>

        <div className='mt-4'>
          <DataTable
            columns={columns}
            data={visibleMarkers}
            isLoading={loading}
            columnFilterRow={false}
            onRowClick={handleRowClick}
            searchableColumns={[{ id: 'designation', title: 'Actif' }]}
            onSearchChange={setSearch}
            toolbar={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' className='h-8'>
                    <Download className='h-4 w-4 mr-2' />
                    Export
                    <ChevronDown className='h-4 w-4 ml-2' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={handleExportExcel} className='gap-2'>
                    <ExcelFileIcon className='h-6 w-6' />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPdf} className='gap-2'>
                    <PdfFileIcon className='h-6 w-6' />
                    PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Geolocation;
