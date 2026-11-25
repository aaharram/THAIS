import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { getD05, getD21 } from '@/store/features/patrimoine/etatReglementaireSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ScrollText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const EtatsReglementaires = () => {
  const dispatch = useAppDispatch();
  const { etat, loading } = useAppSelector((state) => state.etatReglementaire);
  const [searchParams] = useSearchParams();
  const [type, setType] = useState<'D21' | 'D05'>(searchParams.get('type') === 'D05' ? 'D05' : 'D21');

  useEffect(() => {
    if (type === 'D21') {
      dispatch(getD21());
    } else {
      dispatch(getD05());
    }
  }, [dispatch, type]);

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={ScrollText}
            title='États Réglementaires'
            description="Déclarations D21 (provisions techniques) et D05 (placements immobiliers) - patrimoine complet, sans filtre de période"
          />

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <Select value={type} onValueChange={(v) => setType(v as 'D21' | 'D05')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='D21'>D21 — Provisions techniques</SelectItem>
                  <SelectItem value='D05'>D05 — Placements immobiliers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className='text-center text-sm text-gray-500 py-10'>Chargement...</div>
        ) : !etat || etat.lignes.length === 0 ? (
          <div className='text-center text-sm text-gray-500 py-10'>Aucune donnée.</div>
        ) : (
          <div className='border rounded-lg overflow-x-auto mt-4'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-gray-500 border-b'>
                  <th className='py-2 px-4 font-medium'>Code Actif</th>
                  <th className='py-2 px-4 font-medium'>Titre Foncier</th>
                  <th className='py-2 px-4 font-medium'>Désignation</th>
                  <th className='py-2 px-4 font-medium text-right'>Valeur d'entrée</th>
                  <th className='py-2 px-4 font-medium text-right'>Amortissement cumulé</th>
                  <th className='py-2 px-4 font-medium text-right'>Valeur d'inventaire</th>
                  <th className='py-2 px-4 font-medium text-right'>Valeur réalisation</th>
                  <th className='py-2 px-4 font-medium text-right'>Vie</th>
                  <th className='py-2 px-4 font-medium text-right'>Non Vie</th>
                  <th className='py-2 px-4 font-medium text-right'>GSR</th>
                  <th className='py-2 px-4 font-medium text-right'>Autres</th>
                  {type === 'D05' && <th className='py-2 px-4 font-medium text-right'>Revenus locatifs</th>}
                </tr>
              </thead>
              <tbody>
                {etat.lignes.map((l) => (
                  <tr key={l.noBuilding} className='border-b last:border-b-0'>
                    <td className='py-2 px-4'>{l.codeImmeuble || '-'}</td>
                    <td className='py-2 px-4'>{l.titreFoncier || '-'}</td>
                    <td className='py-2 px-4 font-medium'>{l.designation}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(l.valeurEntree)}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(l.amortissementCumule)}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(l.valeurInventaire)}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(l.valeurRealisation)}</td>
                    <td className='py-2 px-4 text-right'>{l.vie ? fmtMontant(l.vie) : '-'}</td>
                    <td className='py-2 px-4 text-right'>{l.nonVie ? fmtMontant(l.nonVie) : '-'}</td>
                    <td className='py-2 px-4 text-right'>{l.gsr ? fmtMontant(l.gsr) : '-'}</td>
                    <td className='py-2 px-4 text-right'>{l.autres ? fmtMontant(l.autres) : '-'}</td>
                    {type === 'D05' && (
                      <td className='py-2 px-4 text-right'>{fmtMontant(l.revenusLocatifs)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className='bg-primary/5 font-bold'>
                  <td className='py-3 px-4' colSpan={3}>
                    Total général
                  </td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(etat.totalValeurEntree)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(etat.totalAmortissementCumule)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(etat.totalValeurInventaire)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(etat.totalValeurRealisation)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(etat.totalVie)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(etat.totalNonVie)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(etat.totalGsr)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(etat.totalAutres)}</td>
                  {type === 'D05' && (
                    <td className='py-3 px-4 text-right'>{fmtMontant(etat.totalRevenusLocatifs)}</td>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EtatsReglementaires;
