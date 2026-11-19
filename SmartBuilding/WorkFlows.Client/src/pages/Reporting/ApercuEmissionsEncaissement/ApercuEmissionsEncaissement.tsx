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
import { MOIS } from '@/store/features/leasing/etat-loyer-schemas';
import { getApercuEmissionsEncaissement } from '@/store/features/leasing/rapportsRecouvrementSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { LineChart } from 'lucide-react';
import { useEffect, useState } from 'react';

const ANNEES = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ApercuEmissionsEncaissement = () => {
  const dispatch = useAppDispatch();
  const { apercu, loading } = useAppSelector((state) => state.rapportsRecouvrement);
  const [annee, setAnnee] = useState(String(new Date().getFullYear()));
  const [mois, setMois] = useState(String(new Date().getMonth() + 1));

  useEffect(() => {
    dispatch(getApercuEmissionsEncaissement({ annee: Number(annee), mois: Number(mois) }));
  }, [dispatch, annee, mois]);

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={LineChart}
            title='Aperçu Émissions / Encaissement'
            description='Résumé global du mois : loyers facturés vs encaissés'
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
          </div>
        </div>

        {loading ? (
          <div className='text-center text-sm text-gray-500 py-10'>Chargement...</div>
        ) : (
          apercu && (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6'>
              <div className='border rounded-lg p-4 space-y-1'>
                <div className='text-xs text-gray-500 uppercase tracking-wide'>Émissions</div>
                <div className='text-2xl font-bold'>{fmtMontant(apercu.totalEmissions)}</div>
                <div className='text-xs text-gray-400'>{apercu.nbFactures} facture(s)</div>
              </div>
              <div className='border rounded-lg p-4 space-y-1'>
                <div className='text-xs text-gray-500 uppercase tracking-wide'>Encaissement</div>
                <div className='text-2xl font-bold'>{fmtMontant(apercu.totalEncaissement)}</div>
              </div>
              <div className='border rounded-lg p-4 space-y-1'>
                <div className='text-xs text-gray-500 uppercase tracking-wide'>Taux d'encaissement</div>
                <div className='text-2xl font-bold'>{apercu.tauxEncaissement.toFixed(2)}%</div>
              </div>
              <div className='border rounded-lg p-4 space-y-1'>
                <div className='text-xs text-gray-500 uppercase tracking-wide'>Écart</div>
                <div className='text-2xl font-bold'>{fmtMontant(apercu.totalEmissions - apercu.totalEncaissement)}</div>
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default ApercuEmissionsEncaissement;
