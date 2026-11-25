import { BaseDialog } from '@/components/dialog/dialog';
import { ImportMenu } from '@/components/import/import-menu';
import { lookupImportConfig } from '@/utils/import/import-configs';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { LookupResponse } from '@/store/features/configuration/lookup-schemas';
import { getLookupModuleConfig, lookupModules } from '@/store/features/configuration/lookupModules';
import { LookupState } from '@/store/features/configuration/lookupSliceFactory';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Settings2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

const GenericLookupList = () => {
  const { module } = useParams<{ module: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LookupResponse | null>(null);
  const [search, setSearch] = useState('');

  const config = module ? getLookupModuleConfig(module) : undefined;
  const slice = config ? lookupModules[config.key] : undefined;

  const state = useAppSelector((s: RootState) =>
    config ? (s[config.key] as unknown as LookupState) : undefined,
  );

  useEffect(() => {
    if (!slice) return;
    dispatch(slice.getAll({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, slice, search]);

  if (!config || !slice || !state) {
    return (
      <Card>
        <CardContent className="p-6">Module de configuration inconnu.</CardContent>
      </Card>
    );
  }

  const { allItems, totalCount, pageNumber, pageSize, loading } = state;

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleDelete = (item: LookupResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(slice.remove(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const columns: ColumnDef<LookupResponse>[] = [
    {
      accessorKey: 'designation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={config.designationLabel ?? 'Désignation'} sorting />
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue('designation')}</div>,
    },
    ...(config.hasRate
      ? [
          {
            accessorKey: 'taux',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title={config.rateLabel ?? 'Taux (%)'} />
            ),
            cell: ({ row }: { row: { original: LookupResponse } }) => (
              <div className="font-medium">{row.original.taux ?? '-'}</div>
            ),
          } as ColumnDef<LookupResponse>,
        ]
      : []),
    ...(config.hasFlag
      ? [
          {
            accessorKey: 'accesComplet',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title={config.flagLabel ?? 'Actif'} />
            ),
            cell: ({ row }: { row: { original: LookupResponse } }) => (
              <Badge variant={row.original.accesComplet ? 'default' : 'secondary'}>
                {row.original.accesComplet ? 'Oui' : 'Non'}
              </Badge>
            ),
          } as ColumnDef<LookupResponse>,
        ]
      : []),
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-yellow-100"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(slice.setItem(row.original));
              navigate(`modifier/${row.original.numero}`);
            }}
          >
            <Pencil className="h-4 w-4 text-yellow-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.original);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) =>
      dispatch(slice.getAll({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) =>
      dispatch(slice.getAll({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <Title
            icon={Settings2}
            title={config.label}
            actions={
              <ImportMenu
                config={lookupImportConfig(slice.apiPath, config.label, config.hasFlag ? config.flagLabel : undefined)}
                onImported={() => dispatch(slice.getAll({ pageNumber: 1, pageSize, search }))}
              />
            }
            description={config.description}
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(slice.resetItem());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'designation', title: 'Désignation' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Confirmer la suppression"
          description={`Êtes-vous sûr de vouloir supprimer "${selectedItem?.designation || ''}" ?`}
        >
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default GenericLookupList;
