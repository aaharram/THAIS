import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { getEtatImpaye } from '@/store/features/leasing/rapportsRecouvrementSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { FileWarning } from 'lucide-react';
import { useEffect } from 'react';

const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const EtatImpaye = () => {
  const dispatch = useAppDispatch();
  const { etatImpaye, loading } = useAppSelector((state) => state.rapportsRecouvrement);

  useEffect(() => {
    dispatch(getEtatImpaye());
  }, [dispatch]);

  return (
    <Card>
      <CardContent className='p-4'>
        <Title
          icon={FileWarning}
          title='État Impayé'
          description="Montants impayés courants, consolidés par propriétaire"
        />

        {loading ? (
          <div className='text-center text-sm text-gray-500 py-10'>Chargement...</div>
        ) : !etatImpaye || etatImpaye.lignes.length === 0 ? (
          <div className='text-center text-sm text-gray-500 py-10'>Aucun impayé.</div>
        ) : (
          <div className='border rounded-lg overflow-x-auto mt-4'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-gray-500 border-b'>
                  <th className='py-2 px-4 font-medium'>Propriétaire</th>
                  <th className='py-2 px-4 font-medium text-center'>Nb Dossiers</th>
                  <th className='py-2 px-4 font-medium text-right'>Montant Impayé (MAD)</th>
                </tr>
              </thead>
              <tbody>
                {etatImpaye.lignes.map((l, idx) => (
                  <tr key={l.noProprietaire ?? idx} className='border-b last:border-b-0'>
                    <td className='py-2 px-4 font-medium'>{l.proprietaire || 'Non renseigné'}</td>
                    <td className='py-2 px-4 text-center'>{l.nbDossiers}</td>
                    <td className='py-2 px-4 text-right text-red-600 font-semibold'>{fmtMontant(l.montantImpaye)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className='bg-primary/5 font-bold'>
                  <td className='py-3 px-4'>Total général</td>
                  <td className='py-3 px-4 text-center'>{etatImpaye.totalDossiers}</td>
                  <td className='py-3 px-4 text-right text-red-600'>{fmtMontant(etatImpaye.totalImpaye)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EtatImpaye;
