import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button';
import { Title } from '@/components/ui/title.tsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import { MembersResponse } from '@/store/features/members/members-schemas';
import {
  deleteMembers,
  getAllMembers,
  getUniqueColumnValues,
  resetMembers,
  setMembers,
} from '@/store/features/members/membersSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../../../../components/ui/card';

function Members() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allMembers, totalCount, pageNumber, pageSize, loading, uniqueColumnValues } =
    useAppSelector((state) => state.members);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<MembersResponse | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, (string | number | boolean)[]>>({});
  const [showDisabled, setShowDisabled] = useState<boolean>(false);
  console.log('allMembers', allMembers);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(
      getAllMembers({
        pageNumber: 1,
        pageSize,
        search: value,
        filters,
        showDisabled,
      }),
    );
  };

  const handleFilterChange = (columnId: string, values: (string | number | boolean)[]) => {
    const capitalizedColumnId = columnId.charAt(0).toUpperCase() + columnId.slice(1);

    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      if (values.length === 0) {
        delete newFilters[capitalizedColumnId];
      } else {
        newFilters[capitalizedColumnId] = values;
      }
      dispatch(
        getAllMembers({
          pageNumber: 1,
          search,
          filters: newFilters,
          showDisabled,
        }),
      );

      return newFilters;
    });
  };

  const handleSortChange = (field: string, order: number) => {
    dispatch(
      getAllMembers({
        pageNumber: 1,
        pageSize,
        search,
        filters,
        sortField: field,
        sortOrder: order,
        showDisabled,
      }),
    );
  };

  const getStatusInfo = (status: string) => {
    if (!status) {
      return {
        color: 'bg-gray-400',
        label: 'Status inconnu',
      };
    }
    switch (status) {
      case 'AVAILABLE':
        return { color: 'bg-green-500', label: 'Disponible' };
      case 'ON_THE_MOVE':
        return { color: 'bg-blue-500', label: 'En déplacement' };
      case 'ON_BREAK':
        return { color: 'bg-yellow-400', label: 'En pause' };
      case 'NOT_AVAILABLE':
        return { color: 'bg-red-500', label: 'Indisponible' };
      default:
        return {
          color: 'bg-gray-400',
          label: status,
        };
    }
  };

  useEffect(() => {
    dispatch(getAllMembers({ pageNumber: 1, pageSize: 10, search, filters, showDisabled }));
  }, [dispatch, search, filters, showDisabled]);

  useEffect(() => {
    const filterableColumns = ['NoCountry', 'NoProvince', 'NoCity'];
    dispatch(getUniqueColumnValues(filterableColumns));
  }, [dispatch]);

  const columns: ColumnDef<MembersResponse>[] = [
    {
      accessorKey: 'avatar',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Avatar' />,
      cell: ({ row }) => {
        const { color, label } = getStatusInfo(row.original.statut);

        return (
          <div className='flex items-center space-x-2'>
            <div className='relative'>
              <Avatar>
                <AvatarImage src={row.original.name} alt={row.original.name} />
                <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`
                absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                ${color}
              `}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <span className='font-medium'>{row.original.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Nom Complet'
          sorting
          onSortChange={handleSortChange}
        />
      ),
      cell: ({ row }) => <div className='font-medium'>{row.getValue('name') || '-'}</div>,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Email'
          sorting
          onSortChange={handleSortChange}
        />
      ),
      cell: ({ row }) => <div className='font-medium'>{row.getValue('email') || '-'}</div>,
    },
    {
      accessorKey: 'tel',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='tél'
          sorting
          onSortChange={handleSortChange}
        />
      ),
      cell: ({ row }) => <div className='font-medium'>{row.getValue('tel') || '-'}</div>,
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Adresse'
          sorting
          onSortChange={handleSortChange}
        />
      ),
      cell: ({ row }) => <div className='font-medium'>{row.getValue('address') || '-'}</div>,
    },
    {
      accessorKey: 'noCountry',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Pays' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nameCountry || '-'}</div>,
    },
    {
      accessorKey: 'noProvince',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Province' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nameProvince || '-'}</div>,
      enableHiding: true,
    },
    {
      accessorKey: 'noCity',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ville' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nameCity || '-'}</div>,
      enableHiding: true,
    },
    {
      accessorKey: 'nomGestionnaire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Gestionnaire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomGestionnaire || '-'}</div>,
    },
    {
      accessorKey: 'nomPatrimoineType',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Droit d’accès' />,
      cell: ({ row }) => (
        <div className='font-medium'>
          <Badge>{row.original.nomPatrimoineType || '-'}</Badge>
        </div>
      ),
    },
    {
      accessorKey: 'enabled',
      header: ({ column }) => (
        <div className='flex justify-center'>
          <DataTableColumnHeader
            column={column}
            title='Statut'
            sorting
            onSortChange={handleSortChange}
          />
        </div>
      ),
      cell: ({ row }) => {
        const enabled = row.getValue('enabled') as string;
        const status = enabled ? 'Active' : 'Inactive';

        return (
          <>
            <div className='flex justify-center items-center h-full py-2'>
              <span
                className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold min-w-[80px] text-center text-white rounded-md ${
                  enabled ? 'bg-success' : 'bg-warning'
                }`}
              >
                {status}
              </span>
            </div>
          </>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },

    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0 hover:bg-yellow-100'
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(setMembers(row.original));
                    const id = row.original.numero;
                    navigate(`modifier/${id}`);
                  }}
                >
                  <Pencil className='h-4 w-4 text-yellow-600' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Modifier le batiment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0 hover:bg-red-100'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row.original);
                  }}
                >
                  <Trash2 className='h-4 w-4 text-red-600' />{' '}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Supprimer le batiment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  const handleDelete = (members: MembersResponse) => {
    setSelectedMembers(members);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMembers) {
      dispatch(deleteMembers(selectedMembers.numero));
      setSelectedMembers(null);
      setDeleteDialogOpen(false);
    }
  };

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) =>
      dispatch(getAllMembers({ pageNumber: newPage + 1, pageSize, search, filters, showDisabled })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllMembers({ pageNumber: 1, pageSize: newSize, search, filters, showDisabled })),
    totalCount,
  };

  const filterableColumns = [
    {
      id: 'noCountry',
      title: 'Pays',
      options: uniqueColumnValues['NoCountry'] || [],
    },
    {
      id: 'noProvince',
      title: 'Province',
      options: uniqueColumnValues['NoProvince'] || [],
    },
    {
      id: 'noCity',
      title: 'Ville',
      options: uniqueColumnValues['NoCity'] || [],
    },
  ];

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={User}
            title='Membres'
            description="Gérez vos Membres, y compris l'ajout, la modification et la suppression des données des Membres."
            buttons={[
              {
                label: 'Ajouter un membre',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetMembers());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allMembers}
          filterableColumns={filterableColumns}
          searchableColumns={[
            {
              id: 'name',
              title: 'Nom du member',
            },
          ]}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          isLoading={loading}
          buttons={[
            {
              label: 'Afficher les services désactivés',
              isSwitch: true,
              variant: 'default',
              isSwitchOn: showDisabled,
              onClick: () => setShowDisabled(!showDisabled),
            },
          ]}
          onRowDoubleClick={(members) => {
            dispatch(setMembers(members));
            const id = members.numero;
            navigate(`details/${id}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer le member "${
            selectedMembers?.name || ''
          }"?`}
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
}

export default Members;
