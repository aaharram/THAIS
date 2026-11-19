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
import { getSuiviEncaissement } from '@/store/features/leasing/rapportsRecouvrementSlice';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Banknote } from 'lucide-react';
import { useEffect, useState } from 'react';

const ANNEES = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SuiviEncaissement = () => {
  const dispatch = useAppDispatch();
  const { suiviEncaissement, loading } = useAppSelector((state) => state.rapportsRecouvrement);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: encaisseurs } = useAppSelector((state) => state.cfgEncaisseurs);

  const [annee, setAnnee] = useState(String(new Date().getFullYear()));
  const [mois, setMois] = useState(String(new Date().getMonth() + 1));
  const [noBuilding, setNoBuilding] = useState('0');
  const [noEncaisseur, setNoEncaisseur] = useState('0');

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 1000 }));
    dispatch(lookupModules.cfgEncaisseurs.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getSuiviEncaissement({
        annee: Number(annee),
        mois: Number(mois),
        noBuilding: Number(noBuilding) || undefined,
        noEncaisseur: Number(noEncaisseur) || undefined,
      }),
    );
  }, [dispatch, annee, mois, noBuilding, noEncaisseur]);

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Banknote}
            title='Suivi Encaissement'
            description='Détail des encaissements par immeuble, avec contexte du bail'
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
              <Label className='text-sm font-medium'>Actif</Label>
              <Select value={noBuilding} onValueChange={setNoBuilding}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Tous les actifs</SelectItem>
                  {buildings.map((b) => (
                    <SelectItem key={b.numero} value={String(b.numero)}>
                      {b.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Encaisseur</Label>
              <Select value={noEncaisseur} onValueChange={setNoEncaisseur}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Tous les encaisseurs</SelectItem>
                  {encaisseurs.map((e) => (
                    <SelectItem key={e.numero} value={String(e.numero)}>
                      {e.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className='text-center text-sm text-gray-500 py-10'>Chargement...</div>
        ) : !suiviEncaissement || suiviEncaissement.buildings.length === 0 ? (
          <div className='text-center text-sm text-gray-500 py-10'>Aucun encaissement pour cette période.</div>
        ) : (
          <div className='space-y-6 mt-4'>
            {suiviEncaissement.buildings.map((b) => (
              <div key={b.noBuilding} className='border rounded-lg overflow-hidden'>
                <div className='bg-gray-50 px-4 py-3 border-b'>
                  <h3 className='text-base font-semibold text-gray-900'>
                    {b.immeuble} {b.codeImmeuble ? `(${b.codeImmeuble})` : ''}
                  </h3>
                </div>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='text-left text-gray-500 border-b'>
                        <th className='py-2 px-4 font-medium'>Locataire</th>
                        <th className='py-2 px-4 font-medium'>Étage</th>
                        <th className='py-2 px-4 font-medium'>Local</th>
                        <th className='py-2 px-4 font-medium'>Mode Paiement</th>
                        <th className='py-2 px-4 font-medium'>Date</th>
                        <th className='py-2 px-4 font-medium text-right'>Encaissement (MAD)</th>
                        <th className='py-2 px-4 font-medium'>Encaisseur</th>
                        <th className='py-2 px-4 font-medium text-right'>Total Mois (MAD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {b.lignes.map((l) => (
                        <tr key={l.noPaiement} className='border-b last:border-b-0'>
                          <td className='py-2 px-4 font-medium'>{l.locataire || '-'}</td>
                          <td className='py-2 px-4'>{l.etage || '-'}</td>
                          <td className='py-2 px-4'>{l.local || '-'}</td>
                          <td className='py-2 px-4'>{l.modePaiement || '-'}</td>
                          <td className='py-2 px-4 whitespace-nowrap'>{fmtDate(l.datePaiement)}</td>
                          <td className='py-2 px-4 text-right font-semibold'>{fmtMontant(l.montant)}</td>
                          <td className='py-2 px-4'>{l.encaisseur || '-'}</td>
                          <td className='py-2 px-4 text-right'>{fmtMontant(l.totalMois)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className='bg-gray-50 font-semibold border-t'>
                        <td className='py-2 px-4' colSpan={5}>
                          Total {b.immeuble}
                        </td>
                        <td className='py-2 px-4 text-right'>{fmtMontant(b.totalEncaissement)}</td>
                        <td className='py-2 px-4' colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ))}

            <div className='border rounded-lg overflow-hidden'>
              <table className='w-full text-sm'>
                <tbody>
                  <tr className='bg-primary/5 font-bold'>
                    <td className='py-3 px-4'>Total général</td>
                    <td className='py-3 px-4 text-right'>{fmtMontant(suiviEncaissement.grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuiviEncaissement;
