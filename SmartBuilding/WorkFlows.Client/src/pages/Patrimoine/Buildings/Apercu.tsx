import { DataTable } from '@/components/table/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { BuildingResponse } from '@/store/features/patrimoine/building-schemas';
import { getBuildingById } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Building2, CirclePlus, ImageOff, Pencil } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

// RMANew (PatrimoineRMANew/Classes/Immeuble.vb, GenerateTable) : aperçu d'un seul actif -
// une mini-liste à une ligne avec le même jeu de colonnes que RMANew (Image, Actif, Code,
// Typologie, Propriété, Ville, Adresse, T.F, Surface Utile, Lots, Baux, Nb Lot Libres, %
// Occupation, Budget de charge, Plan, Détails), pas le formulaire de saisie complet -
// atteint depuis la fiche "Voir détails" de la carte Géolocalisation, comme le lien
// Immeuble.aspx?Valeur=X de RMANew.
const Apercu = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { item } = useAppSelector((state) => state.buildings);

  useEffect(() => {
    if (id) {
      dispatch(getBuildingById(Number(id)));
    }
  }, [dispatch, id]);

  const taux = item && item.nbLocaux > 0 ? (item.nbBaux / item.nbLocaux) * 100 : 0;
  // RMANew (Immeuble.vb, "NbLocLib") : count(Local) où Occupation=0 - ce schéma n'a pas
  // ce flag sur Local (voir Buildings.tsx/handleDownloadFiche pour la même limitation),
  // approximé par le nombre de locaux sans bail actif.
  const nbLocauxVacant = item ? Math.max(item.nbLocaux - item.nbBaux, 0) : 0;

  const columns: ColumnDef<BuildingResponse>[] = [
    {
      id: 'image',
      header: 'Image',
      cell: () => (
        <div className='flex items-center justify-center h-9 w-9 rounded-md bg-gray-100 text-gray-400'>
          <ImageOff className='h-4 w-4' />
        </div>
      ),
    },
    {
      accessorKey: 'designation',
      header: 'Actif',
      cell: ({ row }) => (
        <div className='font-medium truncate max-w-[220px]' title={row.original.designation}>
          {row.original.designation}
        </div>
      ),
    },
    {
      accessorKey: 'codeImmeuble',
      header: 'Code',
      cell: ({ row }) => <div className='font-medium'>{row.original.codeImmeuble}</div>,
    },
    {
      accessorKey: 'nomBuildingType',
      header: 'Typologie',
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuildingType || '-'}</div>,
    },
    {
      id: 'propriete',
      // RMANew (Immeuble.vb) : Building.NoProprieteType (1=Mono-propriété,
      // 2=Co-propriété, 5=Cession de Bail) - un champ du même nom existe côté
      // Smart-Building mais porte un tout autre sens (discriminant Immeuble | Bien),
      // donc pas d'équivalent fiable ici.
      header: 'Propriété',
      cell: () => <div className='font-medium text-muted-foreground'>-</div>,
    },
    {
      accessorKey: 'nomCity',
      header: 'Ville',
      cell: ({ row }) => <div className='font-medium'>{row.original.nomCity || '-'}</div>,
    },
    {
      accessorKey: 'address1',
      header: 'Adresse',
      cell: ({ row }) => (
        <div className='font-medium truncate max-w-[220px]' title={row.original.address1 ?? undefined}>
          {row.original.address1 || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'titreFoncier',
      header: 'T.F',
      cell: ({ row }) => <div className='font-medium'>{row.original.titreFoncier || '-'}</div>,
    },
    {
      accessorKey: 'surfaceUtile',
      header: () => <div>Surface Utile (m²)</div>,
      cell: ({ row }) => <div className='font-medium'>{row.original.surfaceUtile ?? '-'}</div>,
    },
    {
      accessorKey: 'nbLocaux',
      header: () => <div className='text-center'>Lots</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-1.5'>
          <button
            type='button'
            className='inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary hover:bg-primary/20 disabled:cursor-default disabled:hover:bg-primary/10'
            disabled={row.original.nbLocaux === 0}
            onClick={() => navigate(`/patrimoine/locaux?building=${row.original.numero}`)}
          >
            {row.original.nbLocaux}
          </button>
          <button
            type='button'
            className='text-primary hover:text-primary/70'
            title='Ajouter un local'
            onClick={() => navigate(`/patrimoine/locaux/ajouter?building=${row.original.numero}`)}
          >
            <CirclePlus className='h-4 w-4' />
          </button>
        </div>
      ),
    },
    {
      accessorKey: 'nbBaux',
      header: () => <div className='text-center'>Baux</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-1.5'>
          <button
            type='button'
            className='inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary hover:bg-primary/20 disabled:cursor-default disabled:hover:bg-primary/10'
            disabled={row.original.nbBaux === 0}
            onClick={() => navigate(`/leasing-management/baux?building=${row.original.numero}`)}
          >
            {row.original.nbBaux}
          </button>
          <button
            type='button'
            className='text-primary hover:text-primary/70'
            title='Ajouter un bail'
            onClick={() => navigate(`/leasing-management/baux/ajouter?building=${row.original.numero}&page=ListBuilding.aspx`)}
          >
            <CirclePlus className='h-4 w-4' />
          </button>
        </div>
      ),
    },
    {
      id: 'nbLotLibres',
      header: () => <div className='text-center'>Nb Lot Libres</div>,
      cell: () => <div className='font-medium text-center'>{nbLocauxVacant}</div>,
    },
    {
      id: 'tauxOccupation',
      header: () => <div className='text-center'>% Occupation</div>,
      cell: () => (
        <div className='font-medium text-center'>{taux.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} %</div>
      ),
    },
    {
      accessorKey: 'budgetCharge',
      header: () => <div>Budget de charge (MAD)</div>,
      cell: ({ row }) => (
        <div className='font-medium'>
          {row.original.budgetCharge.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      id: 'plan',
      // RMANew (Immeuble.vb) : lien vers le fichier de plan s'il existe sur disque,
      // sinon "Aucun" - pas de stockage de fichiers pour l'instant côté Smart-Building
      // (même limitation que la colonne Image), donc toujours "Aucun" ici.
      header: () => <div className='text-center'>Plan</div>,
      cell: () => <div className='text-center text-muted-foreground'>Aucun</div>,
    },
    {
      id: 'details',
      header: () => <div className='text-right'>Détails</div>,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <button
            type='button'
            className='inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-yellow-100'
            title='Modifier'
            onClick={() => navigate(`/patrimoine/actifs/modifier/${row.original.numero}`)}
          >
            <Pencil className='h-4 w-4 text-yellow-600' />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={Building2} title='Actifs' description={item?.designation} />
          <DataTable columns={columns} data={item ? [item] : []} columnFilterRow={false} />
        </div>
      </CardContent>
    </Card>
  );
};

export default Apercu;
