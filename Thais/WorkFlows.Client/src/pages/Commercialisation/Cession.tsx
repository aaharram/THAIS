import { ExportTiles } from '@/components/export/export-tiles';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { BaseDialog } from '@/components/dialog/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/title';
import { BuildingRequest, BuildingResponse } from '@/store/features/patrimoine/building-schemas';
import { deleteBuilding, editBuilding } from '@/store/features/patrimoine/buildingsSlice';
import { LocalRequest, LocalResponse } from '@/store/features/patrimoine/local-schemas';
import { deleteLocal, editLocal } from '@/store/features/patrimoine/locauxSlice';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowLeft,
  FileText,
  Handshake,
  Pencil,
  Search,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const EXPORT_HEADER = [
  'Actif',
  'No TF',
  'Situation (Libre/ Occupé)',
  'Impayé loyer pour local occupé',
  'Acquéreur',
  'Acte signé (Promesse / Contrat)',
  'Date de signature promesse',
  'Date de signature du contrat de vente',
  "Date d'enregistrement du contrat de vente",
  'Valeur Entrée',
  'Plus value',
  'Prix de cession (MAD)',
  'Valeur Inventaire',
  'Valeur Realisation',
  'Encaissement reçu',
  'Date de règlement',
  'Observation',
];

const formatMt = (v: number | null | undefined) =>
  v == null ? '' : v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

const formatDate = (v: string | null | undefined) => (v ? v.substring(0, 10) : '');

type CessionRow = {
  key: string;
  type: 'building' | 'local';
  numero: number;
  noBuilding: number;
  designation: string;
  titreFoncier: string | null | undefined;
  occupe: boolean;
  acquereur: string | null | undefined;
  promesseContratVente: string | null | undefined;
  dateSignaturePromesseVente: string | null | undefined;
  dateSignatureContratVente: string | null | undefined;
  dateEnregistrementContratVente: string | null | undefined;
  valeurEntree: number | null | undefined;
  valeurInventaire: number | null | undefined;
  valeurRealisation: number | null | undefined;
  prixCession: number | null | undefined;
  encaissementRecuCession: number | null | undefined;
  dateReglementCession: string | null | undefined;
  observation: string | null | undefined;
  vendu: boolean;
};

type CessionForm = {
  acquereur: string;
  promesseContratVente: string;
  dateSignaturePromesseVente: string;
  dateSignatureContratVente: string;
  dateEnregistrementContratVente: string;
  prixCession: number | null;
  valeurRealisation: number | null;
  encaissementRecuCession: number | null;
  dateReglementCession: string;
  observation: string;
  vendu: boolean;
};

const emptyCessionForm: CessionForm = {
  acquereur: '',
  promesseContratVente: '',
  dateSignaturePromesseVente: '',
  dateSignatureContratVente: '',
  dateEnregistrementContratVente: '',
  prixCession: null,
  valeurRealisation: null,
  encaissementRecuCession: null,
  dateReglementCession: '',
  observation: '',
  vendu: false,
};

const Cession = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);

  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [locaux, setLocaux] = useState<LocalResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [noProprietaire, setNoProprietaire] = useState<string>('0');
  const [search, setSearch] = useState('');
  const [editRow, setEditRow] = useState<CessionRow | null>(null);
  const [form, setForm] = useState<CessionForm>(emptyCessionForm);
  const [saving, setSaving] = useState(false);

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

  const loadAll = async () => {
    setLoading(true);
    try {
      const [allBuildings, allLocaux] = await Promise.all([
        fetchAllPages<BuildingResponse>('/api/buildings'),
        fetchAllPages<LocalResponse>('/api/locaux'),
      ]);
      setBuildings(allBuildings);
      setLocaux(allLocaux);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
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
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Même logique que RMANew (ListVentes) : si le titre foncier est "Morcelé", la
  // cession se fait lot par lot (Local.AVendre), sinon l'actif entier est à céder
  // (Building.AVendre).
  const rows: CessionRow[] = useMemo(() => {
    const occupationByBuilding = new Map<number, boolean>();
    locaux.forEach((l) => {
      if (!l.mettreEnLocation && !l.inactif) {
        occupationByBuilding.set(l.noBuilding, true);
      }
    });

    // Même règle que RMANew (ListVentes.GetTableJson) : le branchement se fait sur
    // Building.TypeTF, jamais sur TitreFoncier (simple référence texte). Si TypeTF =
    // "Morcelé", l'actif est cédé lot par lot (ses Locaux AVendre) et la ligne
    // "immeuble" n'apparaît pas ; sinon c'est l'immeuble entier qui apparaît (dès
    // qu'il est AVendre, ou qu'un de ses lots l'est).
    const buildingRows: CessionRow[] = buildings
      .filter(
        (b) =>
          !b.inactif &&
          b.typeTF !== 'Morcelé' &&
          (b.aVendre || locaux.some((l) => l.noBuilding === b.numero && l.aVendre && !l.inactif)),
      )
      .map((b) => ({
        key: `b-${b.numero}`,
        type: 'building',
        numero: b.numero,
        noBuilding: b.numero,
        designation: b.designation,
        titreFoncier: b.titreFoncier,
        occupe: occupationByBuilding.get(b.numero) ?? false,
        acquereur: b.acquereur,
        promesseContratVente: b.promesseContratVente,
        dateSignaturePromesseVente: b.dateSignaturePromesseVente,
        dateSignatureContratVente: b.dateSignatureContratVente,
        dateEnregistrementContratVente: b.dateEnregistrementContratVente,
        valeurEntree:
          (b.valeurEntreeTerrain ?? 0) + (b.valeurEntreeConstruction ?? 0) + (b.valeurAmenagement ?? 0) || null,
        valeurInventaire: b.valeurInventaire,
        valeurRealisation: b.valeurRealisation,
        prixCession: b.prixCession,
        encaissementRecuCession: b.encaissementRecuCession,
        dateReglementCession: b.dateReglementCession,
        observation: b.observation,
        vendu: b.vendu,
      }));

    const localRows: CessionRow[] = locaux
      .filter((l) => {
        if (l.inactif || !l.aVendre) return false;
        const building = buildings.find((b) => b.numero === l.noBuilding);
        return building?.typeTF === 'Morcelé';
      })
      .map((l) => ({
        key: `l-${l.numero}`,
        type: 'local',
        numero: l.numero,
        noBuilding: l.noBuilding,
        designation: l.nomBuilding ? `${l.nomBuilding} - ${l.designation}` : l.designation,
        titreFoncier: l.titreFoncier,
        occupe: !l.mettreEnLocation,
        acquereur: l.acquereur,
        promesseContratVente: l.promesseContratVente,
        dateSignaturePromesseVente: l.dateSignaturePromesseVente,
        dateSignatureContratVente: l.dateSignatureContratVente,
        dateEnregistrementContratVente: l.dateEnregistrementContratVente,
        valeurEntree: l.valeurEntree,
        valeurInventaire: l.valeurInventaire,
        valeurRealisation: l.valeurRealisation,
        prixCession: l.prixCession,
        encaissementRecuCession: l.encaissementRecuCession,
        dateReglementCession: l.dateReglementCession,
        observation: l.observation,
        vendu: l.vendu,
      }));

    return [...buildingRows, ...localRows];
  }, [buildings, locaux]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const proprietaireId = noProprietaire === '0' ? null : Number(noProprietaire);

    return rows.filter((r) => {
      if (proprietaireId !== null) {
        const building = buildings.find((b) => b.numero === r.noBuilding);
        if (building?.noProprietaire !== proprietaireId) return false;
      }
      if (term && !r.designation.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [rows, search, noProprietaire, buildings]);

  const exportRows = () =>
    filteredItems.map((r) => [
      r.designation,
      r.titreFoncier ?? '',
      r.occupe ? 'Occupé' : 'Libre',
      '',
      r.acquereur ?? '',
      r.promesseContratVente ?? '',
      formatDate(r.dateSignaturePromesseVente),
      formatDate(r.dateSignatureContratVente),
      formatDate(r.dateEnregistrementContratVente),
      formatMt(r.valeurEntree),
      formatMt((r.prixCession ?? 0) - (r.valeurInventaire ?? 0)),
      formatMt(r.prixCession),
      formatMt(r.valeurInventaire),
      formatMt(r.valeurRealisation),
      formatMt(r.encaissementRecuCession),
      formatDate(r.dateReglementCession),
      r.observation ?? '',
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
    const sheet = workbook.addWorksheet('Cession');
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
      `Cession-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Cession', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
      styles: { fontSize: 6 },
    });
    doc.save(`Cession-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const openEdit = (row: CessionRow) => {
    setEditRow(row);
    setForm({
      acquereur: row.acquereur ?? '',
      promesseContratVente: row.promesseContratVente ?? '',
      dateSignaturePromesseVente: formatDate(row.dateSignaturePromesseVente),
      dateSignatureContratVente: formatDate(row.dateSignatureContratVente),
      dateEnregistrementContratVente: formatDate(row.dateEnregistrementContratVente),
      prixCession: row.prixCession ?? null,
      valeurRealisation: row.valeurRealisation ?? null,
      encaissementRecuCession: row.encaissementRecuCession ?? null,
      dateReglementCession: formatDate(row.dateReglementCession),
      observation: row.observation ?? '',
      vendu: row.vendu,
    });
  };

  const handleSave = async () => {
    if (!editRow) return;
    setSaving(true);
    try {
      const patch = {
        acquereur: form.acquereur || null,
        promesseContratVente: form.promesseContratVente || null,
        dateSignaturePromesseVente: form.dateSignaturePromesseVente || null,
        dateSignatureContratVente: form.dateSignatureContratVente || null,
        dateEnregistrementContratVente: form.dateEnregistrementContratVente || null,
        prixCession: form.prixCession,
        encaissementRecuCession: form.encaissementRecuCession,
        dateReglementCession: form.dateReglementCession || null,
        vendu: form.vendu,
      };

      if (editRow.type === 'building') {
        const building = buildings.find((b) => b.numero === editRow.numero);
        if (!building) return;
        const payload = {
          ...building,
          ...patch,
          valeurRealisation: form.valeurRealisation,
          observation: form.observation || null,
        } as unknown as BuildingRequest;
        await dispatch(editBuilding({ id: editRow.numero, updatedItem: payload })).unwrap();
        // Même règle que RMANew (DataEntryVentes.AfterSave -> DeactiverBuilding) :
        // marquer "Vendu" désactive l'actif en cascade (Locaux, Baux).
        if (form.vendu) {
          await dispatch(deleteBuilding(editRow.numero)).unwrap();
        }
      } else {
        const local = locaux.find((l) => l.numero === editRow.numero);
        if (!local) return;
        const payload = {
          ...local,
          ...patch,
          valeurRealisation: form.valeurRealisation,
          observation: form.observation || null,
        } as unknown as LocalRequest;
        await dispatch(editLocal({ id: editRow.numero, updatedItem: payload })).unwrap();
        // Même règle que RMANew (DataEntryVentes.AfterSave -> DeactiverLot).
        if (form.vendu) {
          await dispatch(deleteLocal(editRow.numero)).unwrap();
        }
      }

      setEditRow(null);
      await loadAll();
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnDef<CessionRow>[] = [
    {
      accessorKey: 'designation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <div className='font-medium whitespace-nowrap'>{row.original.designation}</div>,
    },
    {
      accessorKey: 'titreFoncier',
      header: ({ column }) => <DataTableColumnHeader column={column} title='No TF' />,
      cell: ({ row }) => <div className='min-w-[90px] whitespace-nowrap'>{row.original.titreFoncier || '-'}</div>,
    },
    {
      id: 'situation',
      header: () => <div className='min-w-[130px]'>Situation (Libre/ Occupé)</div>,
      cell: ({ row }) => <div className='whitespace-nowrap'>{row.original.occupe ? 'Occupé' : 'Libre'}</div>,
    },
    {
      id: 'impaye',
      header: () => <div className='min-w-[150px]'>Impayé loyer pour local occupé</div>,
      cell: () => <div>-</div>,
    },
    {
      accessorKey: 'acquereur',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Acquéreur' />,
      cell: ({ row }) => <div className='min-w-[140px] whitespace-nowrap'>{row.original.acquereur || '-'}</div>,
    },
    {
      id: 'acteSigne',
      header: () => <div className='min-w-[150px]'>Acte signé (Promesse / Contrat)</div>,
      cell: ({ row }) => <div className='whitespace-nowrap'>{row.original.promesseContratVente || '-'}</div>,
    },
    {
      id: 'dateSignaturePromesse',
      header: () => <div className='min-w-[140px]'>Date de signature promesse</div>,
      cell: ({ row }) => <div className='whitespace-nowrap'>{formatDate(row.original.dateSignaturePromesseVente) || '-'}</div>,
    },
    {
      id: 'dateSignatureContrat',
      header: () => <div className='min-w-[160px]'>Date de signature du contrat de vente</div>,
      cell: ({ row }) => <div className='whitespace-nowrap'>{formatDate(row.original.dateSignatureContratVente) || '-'}</div>,
    },
    {
      id: 'dateEnregistrementContrat',
      header: () => <div className='min-w-[180px]'>Date d&apos;enregistrement du contrat de vente</div>,
      cell: ({ row }) => <div className='whitespace-nowrap'>{formatDate(row.original.dateEnregistrementContratVente) || '-'}</div>,
    },
    {
      id: 'valeurEntree',
      header: () => <div className='text-right min-w-[130px]'>Valeur Entrée</div>,
      cell: ({ row }) => <div className='text-right whitespace-nowrap'>{formatMt(row.original.valeurEntree) || '-'}</div>,
    },
    {
      id: 'plusValue',
      header: () => <div className='text-right min-w-[110px]'>Plus value</div>,
      cell: ({ row }) => {
        const val =
          row.original.prixCession != null || row.original.valeurInventaire != null
            ? (row.original.prixCession ?? 0) - (row.original.valeurInventaire ?? 0)
            : null;
        return <div className='text-right whitespace-nowrap'>{formatMt(val) || '-'}</div>;
      },
    },
    {
      id: 'prixCession',
      header: () => <div className='text-right min-w-[150px]'>Prix de cession (MAD)</div>,
      cell: ({ row }) => <div className='text-right whitespace-nowrap'>{formatMt(row.original.prixCession) || '-'}</div>,
    },
    {
      id: 'valeurInventaire',
      header: () => <div className='text-right min-w-[140px]'>Valeur Inventaire</div>,
      cell: ({ row }) => <div className='text-right whitespace-nowrap'>{formatMt(row.original.valeurInventaire) || '-'}</div>,
    },
    {
      id: 'valeurRealisation',
      header: () => <div className='text-right min-w-[140px]'>Valeur Realisation</div>,
      cell: ({ row }) => <div className='text-right whitespace-nowrap'>{formatMt(row.original.valeurRealisation) || '-'}</div>,
    },
    {
      id: 'encaissementRecu',
      header: () => <div className='text-right min-w-[140px]'>Encaissement reçu</div>,
      cell: ({ row }) => <div className='text-right whitespace-nowrap'>{formatMt(row.original.encaissementRecuCession) || '-'}</div>,
    },
    {
      id: 'dateReglement',
      header: () => <div className='min-w-[130px]'>Date de règlement</div>,
      cell: ({ row }) => <div className='whitespace-nowrap'>{formatDate(row.original.dateReglementCession) || '-'}</div>,
    },
    {
      id: 'fiche',
      header: () => <div className='text-center'>Fiche de présentation</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            title='Voir la fiche'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patrimoine/actifs/details/${row.original.noBuilding}`);
            }}
          >
            <FileText className='h-4 w-4' />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: 'observation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Observation' />,
      cell: ({ row }) => <div className='max-w-[220px] truncate'>{row.original.observation || '-'}</div>,
    },
    {
      id: 'details',
      header: () => <div className='text-center'>Détails</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            title='Modifier'
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row.original);
            }}
          >
            <Pencil className='h-4 w-4' />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className='space-y-4'>
      <Card>
        <CardContent className='p-4'>
          <div className='space-y-4'>
            <Title icon={Handshake} title='Cession' description='Gestion des dossiers de cession' />
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-4'>
            <div className='relative flex-1'>
              <span className='absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground'>
                <Search className='h-4 w-4' />
              </span>
              <Input
                placeholder='Recherche...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-8'
              />
            </div>
            <div className='w-full sm:w-56'>
              <select
                className='w-full h-9 rounded-md border border-input bg-background px-3 text-sm'
                value={noProprietaire}
                onChange={(e) => setNoProprietaire(e.target.value)}
              >
                <option value='0'>Tous les Propriétaires</option>
                {proprietaires.map((p) => (
                  <option key={p.numero} value={p.numero.toString()}>
                    {p.designation}
                  </option>
                ))}
              </select>
            </div>
            <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
          </div>

          <DataTable columns={columns} data={filteredItems} isLoading={loading} />
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button variant='outline' onClick={() => navigate('/commercialisation')}>
          <ArrowLeft className='h-4 w-4 mr-2 border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary' />
          Retour
        </Button>
      </div>

      <BaseDialog
        open={!!editRow}
        onOpenChange={(open) => !open && setEditRow(null)}
        title={editRow ? `Cession - ${editRow.designation}` : ''}
        onCancel={() => setEditRow(null)}
        onConfirm={handleSave}
        confirmText='Sauvegarder'
        loading={saving}
        size='lg'
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='acquereur'>Acquéreur</Label>
            <Input
              id='acquereur'
              value={form.acquereur}
              onChange={(e) => setForm((prev) => ({ ...prev, acquereur: e.target.value }))}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='promesseContratVente'>Acte signé (Promesse / Contrat)</Label>
            <Input
              id='promesseContratVente'
              value={form.promesseContratVente}
              onChange={(e) => setForm((prev) => ({ ...prev, promesseContratVente: e.target.value }))}
              placeholder='Nom du document'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='dateSignaturePromesseVente'>Date de signature promesse</Label>
            <Input
              id='dateSignaturePromesseVente'
              type='date'
              value={form.dateSignaturePromesseVente}
              onChange={(e) => setForm((prev) => ({ ...prev, dateSignaturePromesseVente: e.target.value }))}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='dateSignatureContratVente'>Date de signature du contrat de vente</Label>
            <Input
              id='dateSignatureContratVente'
              type='date'
              value={form.dateSignatureContratVente}
              onChange={(e) => setForm((prev) => ({ ...prev, dateSignatureContratVente: e.target.value }))}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='dateEnregistrementContratVente'>Date d&apos;enregistrement du contrat de vente</Label>
            <Input
              id='dateEnregistrementContratVente'
              type='date'
              value={form.dateEnregistrementContratVente}
              onChange={(e) => setForm((prev) => ({ ...prev, dateEnregistrementContratVente: e.target.value }))}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='prixCession'>Prix de cession (MAD)</Label>
            <Input
              id='prixCession'
              type='number'
              value={form.prixCession ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, prixCession: e.target.value === '' ? null : Number(e.target.value) }))
              }
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='valeurRealisation'>Valeur Realisation</Label>
            <Input
              id='valeurRealisation'
              type='number'
              value={form.valeurRealisation ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  valeurRealisation: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='encaissementRecuCession'>Encaissement reçu</Label>
            <Input
              id='encaissementRecuCession'
              type='number'
              value={form.encaissementRecuCession ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  encaissementRecuCession: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='dateReglementCession'>Date de règlement</Label>
            <Input
              id='dateReglementCession'
              type='date'
              value={form.dateReglementCession}
              onChange={(e) => setForm((prev) => ({ ...prev, dateReglementCession: e.target.value }))}
            />
          </div>
          <div className='flex items-center gap-2 pt-6'>
            <Checkbox
              id='vendu'
              checked={form.vendu}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, vendu: checked === true }))}
            />
            <Label htmlFor='vendu'>Vendu</Label>
          </div>
          <div className='space-y-2 sm:col-span-2'>
            <Label htmlFor='observation'>Observation</Label>
            <Textarea
              id='observation'
              rows={3}
              value={form.observation}
              onChange={(e) => setForm((prev) => ({ ...prev, observation: e.target.value }))}
            />
          </div>
        </div>
      </BaseDialog>
    </div>
  );
};

export default Cession;
