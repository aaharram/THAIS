import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { getImpayesParAge } from '@/store/features/leasing/etatLoyerSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { FileWarning } from 'lucide-react';
import { useEffect, useState } from 'react';

const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ImpayesParAge = () => {
  const dispatch = useAppDispatch();
  const { impayesParAge, loading } = useAppSelector((state) => state.etatLoyer);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const [noProprietaire, setNoProprietaire] = useState('0');

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getImpayesParAge({ noProprietaire: Number(noProprietaire) || undefined }));
  }, [dispatch, noProprietaire]);

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={FileWarning}
            title='Impayés par Âge'
            description="Répartition des loyers impayés par ancienneté, avec provisionnement indicatif"
          />

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Propriétaire</Label>
              <Select value={noProprietaire} onValueChange={setNoProprietaire}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Tous les propriétaires</SelectItem>
                  {proprietaires.map((p) => (
                    <SelectItem key={p.numero} value={String(p.numero)}>
                      {p.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className='text-center text-sm text-gray-500 py-10'>Chargement...</div>
        ) : !impayesParAge || impayesParAge.buildings.length === 0 ? (
          <div className='text-center text-sm text-gray-500 py-10'>Aucun loyer impayé.</div>
        ) : (
          <div className='border rounded-lg overflow-x-auto mt-4'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-gray-500 border-b'>
                  <th className='py-2 px-4 font-medium'>Actif</th>
                  <th className='py-2 px-4 font-medium text-right'>{'< 3 mois (MAD)'}</th>
                  <th className='py-2 px-4 font-medium text-right'>{'3 à 6 mois (MAD)'}</th>
                  <th className='py-2 px-4 font-medium text-right'>{'6 mois à 1 an (MAD)'}</th>
                  <th className='py-2 px-4 font-medium text-right'>{'> 12 mois (MAD)'}</th>
                  <th className='py-2 px-4 font-medium text-right'>Total (MAD)</th>
                  <th className='py-2 px-4 font-medium text-right'>Provision Douteux</th>
                  <th className='py-2 px-4 font-medium text-right'>Provision Contentieux</th>
                  <th className='py-2 px-4 font-medium text-right'>Total Provision</th>
                </tr>
              </thead>
              <tbody>
                {impayesParAge.buildings.map((b) => (
                  <tr key={b.noBuilding} className='border-b last:border-b-0'>
                    <td className='py-2 px-4 font-medium'>
                      {b.immeuble} {b.codeImmeuble ? `(${b.codeImmeuble})` : ''}
                    </td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(b.moinsDe3Mois)}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(b.entre3Et6Mois)}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(b.entre6MoisEt1An)}</td>
                    <td className='py-2 px-4 text-right text-red-600'>{fmtMontant(b.plusDe12Mois)}</td>
                    <td className='py-2 px-4 text-right font-semibold'>{fmtMontant(b.total)}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(b.provisionDouteux)}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(b.provisionContentieux)}</td>
                    <td className='py-2 px-4 text-right font-semibold'>{fmtMontant(b.totalProvision)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className='bg-primary/5 font-bold'>
                  <td className='py-3 px-4'>Total général</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(impayesParAge.totalMoinsDe3Mois)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(impayesParAge.totalEntre3Et6Mois)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(impayesParAge.totalEntre6MoisEt1An)}</td>
                  <td className='py-3 px-4 text-right text-red-600'>{fmtMontant(impayesParAge.totalPlusDe12Mois)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(impayesParAge.totalGeneral)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(impayesParAge.totalProvisionDouteux)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(impayesParAge.totalProvisionContentieux)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(impayesParAge.totalProvision)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImpayesParAge;
