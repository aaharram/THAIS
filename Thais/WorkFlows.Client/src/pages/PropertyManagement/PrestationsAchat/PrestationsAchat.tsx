import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImportMenu } from '@/components/import/import-menu';
import { PRESTATIONS_ACHAT_IMPORT } from '@/utils/import/import-configs';
import { Title } from '@/components/ui/title';
import { PrestationAchatResponse } from '@/store/features/property-management/prestation-achat-schemas';
import {
  amortirPrestationAchat,
  deletePrestationAchat,
  getAllPrestationsAchat,
  resetPrestationAchat,
  setPrestationAchat,
} from '@/store/features/property-management/prestationsAchatSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Calculator, ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const PrestationsAchat = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.prestationsAchatPm,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PrestationAchatResponse | null>(null);
  const [amortirDialogOpen, setAmortirDialogOpen] = useState(false);
  const [amortirItem, setAmortirItem] = useState<PrestationAchatResponse | null>(null);
  const [dureeMois, setDureeMois] = useState<string>('12');
  const [taux, setTaux] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllPrestationsAchat({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllPrestationsAchat({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: PrestationAchatResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deletePrestationAchat(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const openAmortir = (item: PrestationAchatResponse) => {
    setAmortirItem(item);
    setDureeMois('12');
    setTaux('');
    setAmortirDialogOpen(true);
  };

  const confirmAmortir = () => {
    if (amortirItem) {
      dispatch(
        amortirPrestationAchat({
          id: amortirItem.numero,
          dureeMois: Number(dureeMois),
          taux: taux === '' ? null : Number(taux),
        }),
      );
      setAmortirItem(null);
      setAmortirDialogOpen(false);
    }
  };

  const fmtMoney = (m?: number | null) => (m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2 }));

  const columns: ColumnDef<PrestationAchatResponse>[] = [
    {
      accessorKey: 'numeroBonCommande',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° Bon' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numeroBonCommande || '-'}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'nomTypologieCharge',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Typologie' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomTypologieCharge || '-'}</div>,
    },
    {
      accessorKey: 'prixUnitaireHT',
      header: ({ column }) => <DataTableColumnHeader column={column} title='PU HT' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMoney(row.original.prixUnitaireHT)}</div>,
    },
    {
      accessorKey: 'quantite',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Qté' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.quantite}</div>,
    },
    {
      accessorKey: 'montantTTC',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant TTC' sorting />,
      cell: ({ row }) => <div className='font-semibold'>{fmtMoney(row.original.montantTTC)}</div>,
    },
    {
      accessorKey: 'estAmorti',
      header: () => <div className='text-center'>Amortissement</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          {row.original.estAmorti ? (
            <span className='inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-green-700 bg-green-100'>
              Amorti
            </span>
          ) : row.original.eligibleAmortissement ? (
            <Button variant='outline' size='sm' className='h-7 text-xs' onClick={() => openAmortir(row.original)}>
              <Calculator className='h-3.5 w-3.5 mr-1' />
              Amortir
            </Button>
          ) : (
            <span className='text-gray-400 text-xs'>N/A</span>
          )}
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
              dispatch(setPrestationAchat(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllPrestationsAchat({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllPrestationsAchat({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={ClipboardList}
            actions={<ImportMenu config={PRESTATIONS_ACHAT_IMPORT} onImported={() => dispatch(getAllPrestationsAchat({ pageNumber: 1, pageSize, search }))} />}
            title='Liste des prestations'
            description='Prestations rattachées aux bons de commande'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetPrestationAchat());
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
            dispatch(setPrestationAchat(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description='Êtes-vous sûr de vouloir supprimer cette prestation ?'
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

        <BaseDialog
          open={amortirDialogOpen}
          onOpenChange={setAmortirDialogOpen}
          title='Amortir la prestation'
          description={`Renseignez les paramètres d'amortissement pour "${amortirItem?.nomTypologieCharge || ''}".`}
        >
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='dureeMois' className='text-sm font-medium'>
                Durée (mois)
              </Label>
              <Input
                id='dureeMois'
                type='number'
                value={dureeMois}
                onChange={(e) => setDureeMois(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='taux' className='text-sm font-medium'>
                Taux (%)
              </Label>
              <Input id='taux' type='number' step='0.01' value={taux} onChange={(e) => setTaux(e.target.value)} />
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setAmortirDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={confirmAmortir}>Amortir</Button>
            </div>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default PrestationsAchat;
