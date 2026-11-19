import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { SinistreResponse } from '@/store/features/property-management/sinistre-schemas';
import {
  deleteSinistre,
  downloadSinistreAttachment,
  getAllSinistres,
  resetSinistre,
  setSinistre,
} from '@/store/features/property-management/sinistresSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Download, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const etapeBadgeClass = (etape: string) => {
  switch (etape) {
    case 'Clôturé':
      return 'text-green-700 bg-green-100';
    case 'Remboursement':
      return 'text-blue-700 bg-blue-100';
    case 'Expertise':
    case 'Réclamation':
      return 'text-yellow-700 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// RMANew (ListSinistre.vb, cHeader) : mêmes colonnes que la liste legacy, à l'exception
// des pièces jointes (PV d'expertise, Fiche Sinistre PDF) - pas d'infra d'upload/génération
// de document dans Smart-Building pour l'instant.
const Sinistres = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.sinistresPm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SinistreResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllSinistres({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllSinistres({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: SinistreResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteSinistre(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
  const fmtNum = (n?: number | null) => (n === null || n === undefined ? '-' : n.toLocaleString('fr-FR'));

  const [downloadingAttachment, setDownloadingAttachment] = useState<string | null>(null);

  const handleDownloadPV = async (item: SinistreResponse) => {
    if (!item.cheminPVExpertise) return;
    setDownloadingAttachment(String(item.numero));
    try {
      await downloadSinistreAttachment(item.numero, 'pv-expertise', item.cheminPVExpertise);
    } finally {
      setDownloadingAttachment(null);
    }
  };

  // Colonnes alignées sur ListSinistre.aspx (RMANew). Note : "Date du Sinistre" y affiche en
  // réalité dateReclamation (pas dateDeclaration) - une inversion de libellé propre au code
  // RMANew d'origine, reproduite ici pour rester fidèle à ce qui s'affiche côté RMANew.
  const columns: ColumnDef<SinistreResponse>[] = [
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <div className='font-medium min-w-[130px] whitespace-nowrap'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocataire || '-'}</div>,
    },
    {
      accessorKey: 'nomTypeSinistre',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nature Reclamation' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomTypeSinistre || '-'}</div>,
    },
    {
      accessorKey: 'dateReclamation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date du Sinistre' sorting />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateReclamation)}</div>,
    },
    {
      accessorKey: 'dateDeclaration',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date de déclaration' sorting />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateDeclaration)}</div>,
    },
    {
      accessorKey: 'etapeSuivi',
      header: () => <div className='text-center'>Étapes du suivi</div>,
      cell: ({ row }) => (
        <div className='flex justify-center min-w-[120px]'>
          <span
            className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full whitespace-nowrap ${etapeBadgeClass(row.original.etapeSuivi)}`}
          >
            {row.original.etapeSuivi}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'cumul',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Cumul en nombre des dossiers remis' />,
      cell: ({ row }) => <div className='font-medium text-center'>{fmtNum(row.original.cumul)}</div>,
    },
    {
      accessorKey: 'noSinistre',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° Sinistre' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.noSinistre || '-'}</div>,
    },
    {
      accessorKey: 'numPoliceAssurance',
      header: ({ column }) => <DataTableColumnHeader column={column} title="N° Police d'assurance" />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numPoliceAssurance || '-'}</div>,
    },
    {
      accessorKey: 'nomAssureur',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Assurance' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomAssureur || '-'}</div>,
    },
    {
      accessorKey: 'nomCourtier',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Courtier d'assurance" />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomCourtier || '-'}</div>,
    },
    {
      accessorKey: 'dateExpertise',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date d'expertise" sorting />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateExpertise)}</div>,
    },
    {
      id: 'pvExpertise',
      header: () => <div className='text-center'>PV d&apos;expertise</div>,
      cell: ({ row }) =>
        row.original.cheminPVExpertise ? (
          <div className='flex justify-center'>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0'
              disabled={downloadingAttachment === String(row.original.numero)}
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadPV(row.original);
              }}
            >
              <Download className='h-4 w-4 text-primary' />
            </Button>
          </div>
        ) : (
          <div className='text-center text-gray-400'>-</div>
        ),
    },
    {
      accessorKey: 'montantRemuneration',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant de remboursement' />,
      cell: ({ row }) => <div className='font-medium text-right'>{fmtNum(row.original.montantRemuneration)}</div>,
    },
    {
      accessorKey: 'dateRemboursement',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date de remboursement' sorting />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateRemboursement)}</div>,
    },
    {
      accessorKey: 'referenceDossierDAG',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Reference Dossier DAG' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.referenceDossierDAG || '-'}</div>,
    },
    {
      accessorKey: 'refDossierAssurance',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Reference Dossier Assurance' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.refDossierAssurance || '-'}</div>,
    },
    {
      accessorKey: 'nomExpert',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom de l'Expert" />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomExpert || '-'}</div>,
    },
    {
      accessorKey: 'montantExpert',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Montant de l'Expert" />,
      cell: ({ row }) => <div className='font-medium text-right'>{fmtNum(row.original.montantExpert)}</div>,
    },
    {
      accessorKey: 'montantFacture',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant de facture' />,
      cell: ({ row }) => <div className='font-medium text-right'>{fmtNum(row.original.montantFacture)}</div>,
    },
    {
      id: 'ficheSinistre',
      header: () => <div className='text-center'>Fiche Sinistre</div>,
      cell: () => (
        <div className='flex justify-center'>
          <Button variant='ghost' size='sm' className='h-8 w-8 p-0' disabled title='Génération PDF non disponible'>
            <Download className='h-4 w-4 text-gray-400' />
          </Button>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-yellow-100'
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setSinistre(row.original));
              navigate(`modifier/${row.original.numero}`);
            }}
          >
            <Pencil className='h-4 w-4 text-yellow-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-red-100'
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.original);
            }}
          >
            <Trash2 className='h-4 w-4 text-red-600' />
          </Button>
        </div>
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getAllSinistres({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllSinistres({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={AlertTriangle}
            title='Gestion des sinistres'
            description='Suivi des sinistres par actif'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetSinistre());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setSinistre(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer ce sinistre "${selectedItem?.idSinistre || ''}" ?`}
        >
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant='destructive' onClick={confirmDelete}>
              Supprimer
            </Button>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default Sinistres;
