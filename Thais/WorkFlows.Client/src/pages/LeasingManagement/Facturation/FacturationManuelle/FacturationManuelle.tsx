import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Title } from '@/components/ui/title';
import { AppDispatch } from '@/store';
import { BailResponse } from '@/store/features/leasing/bail-schemas';
import { getAllBaux } from '@/store/features/leasing/bauxSlice';
import { genererFacture, getAllFactures } from '@/store/features/leasing/facturesSlice';
import { useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { PenLine } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

const moisCourant = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// RMANew (ListLocatairesGestionQuittance.aspx + DataEntryQuittance.vb) : à la différence
// d'"Avis d'échéance/Facture" qui liste les factures déjà émises, cet écran liste les
// baux actifs pour balayer une période et générer en un clic celles qui manquent -
// le même moteur de génération que "Générer une facture", juste une entrée différente.
const FacturationManuelle = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const { allItems: baux, loading } = useAppSelector((state) => state.baux);
  const { allItems: factures } = useAppSelector((state) => state.factures);
  const [periodeMois, setPeriodeMois] = useState(moisCourant());
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getAllBaux({ pageNumber: 1, pageSize: 200 }));
    dispatch(getAllFactures({ pageNumber: 1, pageSize: 500 }));
  }, [dispatch]);

  const periodeDate = `${periodeMois}-01`;

  const facturesDeLaPeriode = useMemo(
    () =>
      new Set(
        factures
          .filter((f) => f.periode.substring(0, 7) === periodeMois && f.etat !== 'Annulée')
          .map((f) => f.noLocation),
      ),
    [factures, periodeMois],
  );

  const handleGenerer = async (bail: BailResponse) => {
    setGeneratingId(bail.numero);
    try {
      await dispatch(
        genererFacture({
          addUser: userId,
          noLocation: bail.numero,
          periode: periodeDate,
          loyerNet: bail.loyerNet ?? null,
          charges: bail.charges ?? null,
          tva: bail.tva ?? null,
          taxe: bail.taxe ?? null,
          autres: bail.autres ?? null,
        }),
      ).unwrap();
      dispatch(getAllFactures({ pageNumber: 1, pageSize: 500 }));
    } catch {
      // l'erreur est déjà remontée via le toast du thunk
    } finally {
      setGeneratingId(null);
    }
  };

  const columns: ColumnDef<BailResponse>[] = [
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contrat' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numContratLocations || '-'}</div>,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocataire || '-'}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'nomLocal',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocal || '-'}</div>,
    },
    {
      accessorKey: 'montant',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loyer (MAD)' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.montant?.toLocaleString('fr-FR') ?? '-'}</div>,
    },
    {
      id: 'statut',
      header: () => <div className='text-center'>Statut période</div>,
      cell: ({ row }) => {
        const dejaGeneree = facturesDeLaPeriode.has(row.original.numero);
        return (
          <div className='flex justify-center'>
            <span
              className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                dejaGeneree ? 'text-green-700 bg-green-100' : 'text-amber-700 bg-amber-100'
              }`}
            >
              {dejaGeneree ? 'Facture générée' : 'À générer'}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => {
        const dejaGeneree = facturesDeLaPeriode.has(row.original.numero);
        return (
          <div className='flex justify-end'>
            <Button
              size='sm'
              disabled={dejaGeneree || generatingId === row.original.numero}
              onClick={() => handleGenerer(row.original)}
            >
              {generatingId === row.original.numero ? 'Génération...' : 'Générer'}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <Title
            icon={PenLine}
            title='Facturation Manuelle'
            description='Émettre une facture par locataire pour une période choisie'
          />
          <div className='space-y-1'>
            <Label htmlFor='periode' className='text-xs text-muted-foreground'>
              Période à facturer
            </Label>
            <Input
              id='periode'
              type='month'
              value={periodeMois}
              onChange={(e) => setPeriodeMois(e.target.value)}
              className='w-48'
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={baux}
          searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
          isLoading={loading}
        />
      </CardContent>
    </Card>
  );
};

export default FacturationManuelle;
