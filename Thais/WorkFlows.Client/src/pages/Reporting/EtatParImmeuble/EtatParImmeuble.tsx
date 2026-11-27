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
import { MOIS } from '@/store/features/leasing/etat-loyer-schemas';
import { getEtatLoyer } from '@/store/features/leasing/etatLoyerSlice';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Landmark } from 'lucide-react';
import { useEffect, useState } from 'react';

const ANNEES = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// RMANew (viewPageEtatParImmeuble.vb) : badge "Vie"/"Non vie"/"N.A" selon Affectation.
// La nouvelle app n'a pas d'entité Affectation séparée - le code (N.A/GSR/GV/GG/AT/FP)
// est un champ texte direct sur Building (NAffectation).
const affectationLabel = (code?: string | null) => {
  if (code === 'GV') return { label: 'Vie', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400' };
  if (code === 'GG') return { label: 'Non vie', className: 'bg-violet-500/10 text-violet-700 dark:text-violet-400' };
  if (code === 'GSR') return { label: 'GSR', className: 'bg-teal-500/10 text-teal-700 dark:text-teal-400' };
  return { label: code || 'N.A', className: 'text-gray-600 bg-gray-100' };
};

const EtatParImmeuble = () => {
  const dispatch = useAppDispatch();
  const { etat, loading } = useAppSelector((state) => state.etatLoyer);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);

  const [annee, setAnnee] = useState(String(new Date().getFullYear()));
  const [mois, setMois] = useState(String(new Date().getMonth() + 1));
  const [noProprietaire, setNoProprietaire] = useState('0');

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 1000 }));
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getEtatLoyer({
        annee: Number(annee),
        mois: Number(mois),
        noProprietaire: Number(noProprietaire) || undefined,
      }),
    );
  }, [dispatch, annee, mois, noProprietaire]);

  const buildingById = new Map(buildings.map((b) => [b.numero, b]));

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Landmark}
            title='État par Immeuble'
            description='Revenu, encaissement et impayé consolidés par actif'
          />

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Année</Label>
              <Select value={annee} onValueChange={setAnnee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANNEES.map((a) => (
                    <SelectItem key={a} value={String(a)}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Mois</Label>
              <Select value={mois} onValueChange={setMois}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOIS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
        ) : !etat || etat.buildings.length === 0 ? (
          <div className='text-center text-sm text-gray-500 py-10'>Aucune donnée pour cette période.</div>
        ) : (
          <div className='border rounded-lg overflow-x-auto mt-4'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-gray-500 border-b'>
                  <th className='py-2 px-4 font-medium'>Actif</th>
                  <th className='py-2 px-4 font-medium'>Code Actif</th>
                  <th className='py-2 px-4 font-medium'>Cpte Général</th>
                  <th className='py-2 px-4 font-medium text-center'>Affectation</th>
                  <th className='py-2 px-4 font-medium text-right'>Revenu (MAD)</th>
                  <th className='py-2 px-4 font-medium text-right'>Encaissement (MAD)</th>
                  <th className='py-2 px-4 font-medium text-right'>Impayé (MAD)</th>
                </tr>
              </thead>
              <tbody>
                {etat.buildings.map((b) => {
                  const affectation = affectationLabel(b.nAffectation ?? buildingById.get(b.noBuilding)?.nAffectation);
                  return (
                    <tr key={b.noBuilding} className='border-b last:border-b-0'>
                      <td className='py-2 px-4 font-medium'>{b.immeuble}</td>
                      <td className='py-2 px-4'>{b.codeImmeuble || '-'}</td>
                      <td className='py-2 px-4'>{b.compteGeneral || '-'}</td>
                      <td className='py-2 px-4 text-center'>
                        <span
                          className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${affectation.className}`}
                        >
                          {affectation.label}
                        </span>
                      </td>
                      <td className='py-2 px-4 text-right'>{fmtMontant(b.revenuTotal)}</td>
                      <td className='py-2 px-4 text-right'>{fmtMontant(b.encaissementTotal)}</td>
                      <td className={`py-2 px-4 text-right font-semibold ${b.impayeTotal > 0 ? 'text-red-600' : ''}`}>
                        {fmtMontant(b.impayeTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className='bg-primary/5 font-bold'>
                  <td className='py-3 px-4' colSpan={4}>
                    Total général
                  </td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(etat.revenuGrandTotal)}</td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(etat.encaissementGrandTotal)}</td>
                  <td className='py-3 px-4 text-right text-red-600'>{fmtMontant(etat.impayeGrandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EtatParImmeuble;
