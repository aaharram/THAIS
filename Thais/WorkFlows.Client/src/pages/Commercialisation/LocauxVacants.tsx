import { ExportTiles } from '@/components/export/export-tiles';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { BuildingResponse } from '@/store/features/patrimoine/building-schemas';
import { LocalResponse } from '@/store/features/patrimoine/local-schemas';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowLeft,
  Building,
  ImageOff,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const NO_FILTER = 'all';
const EXPORT_HEADER = ['Actif', 'Adresse', 'Ville', 'Superficie (m²)', 'Locaux vacants'];

// Même format que RMANew (Double.ToString("### ### ##0.##")) : séparateur de milliers
// en espace, jusqu'à 2 décimales.
const formatSuperficie = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

const LocauxVacants = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);

  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [locaux, setLocaux] = useState<LocalResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [noProprietaire, setNoProprietaire] = useState<string>('0');
  const [search, setSearch] = useState('');
  const [minSuperficie, setMinSuperficie] = useState(NO_FILTER);
  const [maxSuperficie, setMaxSuperficie] = useState(NO_FILTER);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  // L'API plafonne pageSize à 100 (au-delà elle retombe silencieusement à 10),
  // donc on récupère tous les immeubles/locaux en paginant nous-mêmes.
  useEffect(() => {
    let cancelled = false;

    const fetchAllPages = async <T,>(path: string) => {
      const pageSize = 100;
      let pageNumber = 1;
      let all: T[] = [];
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data } = await api.get<{ items: T[]; totalCount: number }>(
          `${API_BASE_URL}${path}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        );
        all = all.concat(data.items);
        if (all.length >= data.totalCount || data.items.length === 0) break;
        pageNumber += 1;
      }
      return all;
    };

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [allBuildings, allLocaux] = await Promise.all([
          fetchAllPages<BuildingResponse>('/api/buildings'),
          fetchAllPages<LocalResponse>('/api/locaux'),
        ]);
        if (!cancelled) {
          setBuildings(allBuildings);
          setLocaux(allLocaux);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // Même règle que RMANew (ViewLocationsActifs) : un local "vacant" = mis en
  // location, actif, et pas encore loué/vendu. Smart-Building n'a pas encore de
  // table de contrats de location, donc "loué" n'est pas exclu ici.
  const vacantCountByBuilding = useMemo(() => {
    const counts = new Map<number, number>();
    locaux.forEach((l) => {
      if (l.mettreEnLocation && !l.inactif) {
        counts.set(l.noBuilding, (counts.get(l.noBuilding) ?? 0) + 1);
      }
    });
    return counts;
  }, [locaux]);

  const buildingsWithVacancies = useMemo(
    () => buildings.filter((b) => (vacantCountByBuilding.get(b.numero) ?? 0) > 0),
    [buildings, vacantCountByBuilding],
  );

  // Mêmes valeurs que RMANew (ListMinSuperficie/ListMaxSuperficie) : les superficies
  // distinctes réellement présentes sur les immeubles, pas une plage arbitraire.
  const superficieValues = useMemo(() => {
    const values = new Set<number>();
    buildings.forEach((b) => {
      if (b.surfaceUtile != null) values.add(b.surfaceUtile);
    });
    return Array.from(values).sort((a, b) => a - b);
  }, [buildings]);

  const filteredItems = useMemo(() => {
    const min = minSuperficie === NO_FILTER ? null : Number(minSuperficie);
    const max = maxSuperficie === NO_FILTER ? null : Number(maxSuperficie);
    const term = search.trim().toLowerCase();
    const proprietaireId = noProprietaire === '0' ? null : Number(noProprietaire);

    return buildingsWithVacancies.filter((b) => {
      if (proprietaireId !== null && b.noProprietaire !== proprietaireId) return false;
      if (
        term &&
        !b.designation.toLowerCase().includes(term) &&
        !(b.address1 ?? '').toLowerCase().includes(term) &&
        !(b.nomCity ?? '').toLowerCase().includes(term)
      ) {
        return false;
      }
      if (min !== null && (b.surfaceUtile ?? 0) < min) return false;
      if (max !== null && (b.surfaceUtile ?? 0) > max) return false;
      return true;
    });
  }, [buildingsWithVacancies, search, minSuperficie, maxSuperficie, noProprietaire]);

  const exportRows = () =>
    filteredItems.map((b) => [
      b.designation,
      b.address1 ?? '',
      b.nomCity ?? '',
      b.surfaceUtile ?? '',
      vacantCountByBuilding.get(b.numero) ?? 0,
    ]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Locaux vacants');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `Locaux-vacants-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Locaux vacants', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
    });
    doc.save(`Locaux-vacants-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<BuildingResponse>[] = [
    {
      id: 'image',
      header: 'Image',
      cell: () => (
        <div className='flex items-center justify-center h-9 w-9 rounded-md bg-gray-100 text-muted-foreground'>
          <ImageOff className='h-4 w-4' />
        </div>
      ),
    },
    {
      accessorKey: 'designation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.getValue('designation')}</div>,
    },
    {
      accessorKey: 'address1',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Adresse' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.address1 || '-'}</div>,
    },
    {
      accessorKey: 'nomCity',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ville' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomCity || '-'}</div>,
    },
    {
      accessorKey: 'surfaceUtile',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Superficie (m²)' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.surfaceUtile ?? '-'}</div>,
    },
    {
      id: 'locauxVacants',
      header: () => <div className='text-center'>Locaux vacants</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <button
            type='button'
            className='inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary hover:bg-primary/20'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patrimoine/locaux?building=${row.original.numero}`);
            }}
          >
            {vacantCountByBuilding.get(row.original.numero) ?? 0}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className='space-y-4'>
      <Card>
        <CardContent className='p-4'>
          <div className='space-y-4'>
            <Title
              icon={Building}
              title='Locaux Vacant'
              description='Suivi des locaux vacants par actif'
              actions={
                <>
              <div className='w-60'>
                <Select value={noProprietaire} onValueChange={setNoProprietaire}>
                  <SelectTrigger className='h-10 rounded-lg bg-card'>
                    <SelectValue placeholder='Tous les propriétaires' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Tous les propriétaires</SelectItem>
                    {proprietaires.map((p) => (
                      <SelectItem key={p.numero} value={p.numero.toString()}>
                        {p.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='w-48'>
                <Select value={minSuperficie} onValueChange={setMinSuperficie}>
                  <SelectTrigger className='h-10 rounded-lg bg-card'>
                    <SelectValue placeholder='Min Superficie' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_FILTER}>Min Superficie</SelectItem>
                    {superficieValues.map((v) => (
                      <SelectItem key={v} value={v.toString()}>
                        {formatSuperficie(v)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='w-48'>
                <Select value={maxSuperficie} onValueChange={setMaxSuperficie}>
                  <SelectTrigger className='h-10 rounded-lg bg-card'>
                    <SelectValue placeholder='Max Superficie' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_FILTER}>Max Superficie</SelectItem>
                    {superficieValues.map((v) => (
                      <SelectItem key={v} value={v.toString()}>
                        {formatSuperficie(v)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
                </>
              }
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredItems}
            searchableColumns={[{ id: 'designation', title: 'Actif' }]}
            onSearchChange={setSearch}
            isLoading={loading}
            onRowDoubleClick={(item) => navigate(`/patrimoine/actifs/details/${item.numero}`)}
          />
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button variant='outline' onClick={() => navigate('/commercialisation')}>
          <ArrowLeft className='h-4 w-4 mr-2 border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary' />
          Retour
        </Button>
      </div>
    </div>
  );
};

export default LocauxVacants;
