import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { ActionButton } from '@/components/table/list-cells';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Title } from '@/components/ui/title';
import { BuildingResponse } from '@/store/features/patrimoine/building-schemas';
import { LocalResponse } from '@/store/features/patrimoine/local-schemas';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { ColumnDef } from '@tanstack/react-table';
import { Archive, Pencil, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const formatMt = (v: number | null | undefined) =>
  v == null ? '' : v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

const formatDate = (v: string | null | undefined) => (v ? v.substring(0, 10) : '');

type VenteRow = {
  key: string;
  type: 'building' | 'local';
  numero: number;
  designation: string;
  titreFoncier: string | null | undefined;
  acquereur: string | null | undefined;
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
};

// RMANew (ListVentesArchives.aspx) : Building.vendu=1 ou un de ses Locaux vendu=1 -
// lecture seule (pas d'action "annuler la vente" côté legacy), édition via un lien crayon
// vers la fiche complète. Source : les listes d'archives (Building/Local.inactif=1), car
// marquer "Vendu" désactive toujours l'actif/local en cascade (cf. Cession.tsx).
const ArchivesVentes = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [locaux, setLocaux] = useState<LocalResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [allBuildings, allLocaux] = await Promise.all([
          fetchAllPages<BuildingResponse>('/api/buildings/archives'),
          fetchAllPages<LocalResponse>('/api/locaux/archives'),
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

  const rows: VenteRow[] = useMemo(() => {
    const buildingRows: VenteRow[] = buildings
      .filter((b) => b.vendu)
      .map((b) => ({
        key: `b-${b.numero}`,
        type: 'building',
        numero: b.numero,
        designation: b.designation,
        titreFoncier: b.titreFoncier,
        acquereur: b.acquereur,
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
      }));

    const localRows: VenteRow[] = locaux
      .filter((l) => l.vendu)
      .map((l) => ({
        key: `l-${l.numero}`,
        type: 'local',
        numero: l.numero,
        designation: l.nomBuilding ? `${l.nomBuilding} - ${l.designation}` : l.designation,
        titreFoncier: l.titreFoncier,
        acquereur: l.acquereur,
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
      }));

    return [...buildingRows, ...localRows];
  }, [buildings, locaux]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => r.designation.toLowerCase().includes(term));
  }, [rows, search]);

  const columns: ColumnDef<VenteRow>[] = [
    {
      accessorKey: 'designation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <div className='font-medium whitespace-nowrap'>{row.original.designation}</div>,
    },
    {
      accessorKey: 'titreFoncier',
      header: ({ column }) => <DataTableColumnHeader column={column} title='No TF' />,
      cell: ({ row }) => <div className='whitespace-nowrap'>{row.original.titreFoncier || '-'}</div>,
    },
    {
      accessorKey: 'acquereur',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Acquéreur' />,
      cell: ({ row }) => <div className='whitespace-nowrap'>{row.original.acquereur || '-'}</div>,
    },
    {
      id: 'dateSignaturePromesse',
      header: () => <div className='min-w-[140px]'>Date signature promesse</div>,
      cell: ({ row }) => <div className='whitespace-nowrap'>{formatDate(row.original.dateSignaturePromesseVente) || '-'}</div>,
    },
    {
      id: 'dateSignatureContrat',
      header: () => <div className='min-w-[140px]'>Date signature contrat</div>,
      cell: ({ row }) => <div className='whitespace-nowrap'>{formatDate(row.original.dateSignatureContratVente) || '-'}</div>,
    },
    {
      id: 'dateEnregistrementContrat',
      header: () => <div className='min-w-[160px]'>Date enregistrement contrat</div>,
      cell: ({ row }) => <div className='whitespace-nowrap'>{formatDate(row.original.dateEnregistrementContratVente) || '-'}</div>,
    },
    {
      id: 'valeurEntree',
      header: () => <div className='text-right min-w-[120px]'>Valeur Entrée</div>,
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
      header: () => <div className='text-right min-w-[130px]'>Prix de cession (MAD)</div>,
      cell: ({ row }) => <div className='text-right whitespace-nowrap'>{formatMt(row.original.prixCession) || '-'}</div>,
    },
    {
      id: 'valeurInventaire',
      header: () => <div className='text-right min-w-[130px]'>Valeur Inventaire</div>,
      cell: ({ row }) => <div className='text-right whitespace-nowrap'>{formatMt(row.original.valeurInventaire) || '-'}</div>,
    },
    {
      id: 'valeurRealisation',
      header: () => <div className='text-right min-w-[130px]'>Valeur Realisation</div>,
      cell: ({ row }) => <div className='text-right whitespace-nowrap'>{formatMt(row.original.valeurRealisation) || '-'}</div>,
    },
    {
      id: 'encaissementRecu',
      header: () => <div className='text-right min-w-[130px]'>Encaissement reçu</div>,
      cell: ({ row }) => <div className='text-right whitespace-nowrap'>{formatMt(row.original.encaissementRecuCession) || '-'}</div>,
    },
    {
      id: 'dateReglement',
      header: () => <div className='min-w-[120px]'>Date de règlement</div>,
      cell: ({ row }) => <div className='whitespace-nowrap'>{formatDate(row.original.dateReglementCession) || '-'}</div>,
    },
    {
      accessorKey: 'observation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Observation' />,
      cell: ({ row }) => <div className='max-w-[220px] truncate'>{row.original.observation || '-'}</div>,
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Détails</div>,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <ActionButton
            icon={Pencil}
            label='Modifier'
            onClick={() => {
              navigate(
                row.original.type === 'building'
                  ? `/patrimoine/actifs/modifier/${row.original.numero}`
                  : `/patrimoine/locaux/modifier/${row.original.numero}`,
              );
            }}
            className='text-yellow-600 hover:bg-yellow-500/10 hover:text-yellow-600'
          />
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={Archive} title='Archives — Ventes' description='Actifs et locaux vendus' />
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
        </div>

        <DataTable columns={columns} data={filteredItems} isLoading={loading} />
      </CardContent>
    </Card>
  );
};

export default ArchivesVentes;
