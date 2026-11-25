import { ExportTiles } from '@/components/export/export-tiles';
import { Card, CardContent } from '@/components/ui/card';
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
import { getPrimeEncaisseur, getRapportEncaisseur } from '@/store/features/leasing/rapportsRecouvrementSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Scale } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

const ANNEES = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const moisLabel = (m: number) => MOIS.find((x) => x.value === m)?.label ?? String(m);

const RapportEncaisseur = () => {
  const dispatch = useAppDispatch();
  const { rapportEncaisseur, primeEncaisseur, loading } = useAppSelector((state) => state.rapportsRecouvrement);
  const { allItems: encaisseurs } = useAppSelector((state) => state.cfgEncaisseurs);
  const [searchParams] = useSearchParams();

  const [vue, setVue] = useState<'rapport' | 'prime'>(searchParams.get('vue') === 'prime' ? 'prime' : 'rapport');
  const [annee, setAnnee] = useState(String(new Date().getFullYear()));
  const [mois, setMois] = useState(String(new Date().getMonth() + 1));
  const [noEncaisseur, setNoEncaisseur] = useState('0');

  useEffect(() => {
    dispatch(lookupModules.cfgEncaisseurs.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (vue === 'rapport') {
      dispatch(getRapportEncaisseur({ annee: Number(annee), noEncaisseur: Number(noEncaisseur) || undefined }));
    } else {
      dispatch(getPrimeEncaisseur({ annee: Number(annee), mois: Number(mois) }));
    }
  }, [dispatch, vue, annee, mois, noEncaisseur]);

  const rapportExportHeader = ['Mois', 'Emissions', 'Encaissement du mois', "Taux d'Encaissement", 'Nombre de Facture'];
  const rapportExportRows = () =>
    rapportEncaisseur?.lignes.map((l) => [moisLabel(l.mois), String(l.emissions), String(l.encaissement), `${l.tauxEncaissement.toFixed(2)}%`, String(l.nbFactures)]) ?? [];

  const primeExportHeader = ['Encaisseur', 'Factures Mois', 'Factures Mois-1', 'Émission', 'Encaissement', 'Taux', 'Forfait', 'Bonus', 'Total Prime'];
  const primeExportRows = () =>
    primeEncaisseur?.lignes.map((l) => [
      l.encaisseur ?? '-',
      String(l.nbFacturesMoisCourant),
      String(l.nbFacturesMoisPrecedent),
      String(l.emission),
      String(l.encaissement),
      l.pourcentage != null ? `${l.pourcentage.toFixed(2)}%` : '-',
      String(l.primeForfait),
      String(l.bonus),
      String(l.totalPrime),
    ]) ?? [];

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(vue === 'rapport' ? 'Rapport Encaisseur' : 'Prime Encaisseur');
    const header = vue === 'rapport' ? rapportExportHeader : primeExportHeader;
    const rows = vue === 'rapport' ? rapportExportRows() : primeExportRows();
    sheet.addRow(header).font = { bold: true };
    rows.forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 20;
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = vue === 'rapport' ? `Rapport-Encaisseur-${annee}.xlsx` : `Prime-Encaisseur-${moisLabel(Number(mois))}-${annee}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new JsPDF({ orientation: 'landscape' });
    const header = vue === 'rapport' ? rapportExportHeader : primeExportHeader;
    const rows = vue === 'rapport' ? rapportExportRows() : primeExportRows();
    doc.text(vue === 'rapport' ? `Rapport Encaisseur ${annee}` : `Prime Encaisseur ${moisLabel(Number(mois))} ${annee}`, 14, 14);
    autoTable(doc, { startY: 20, head: [header], body: rows, styles: { fontSize: 8 } });
    doc.save(vue === 'rapport' ? `Rapport-Encaisseur-${annee}.pdf` : `Prime-Encaisseur-${moisLabel(Number(mois))}-${annee}.pdf`);
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Scale}
            title='Rapport / Prime Encaisseur'
            description='Performance mensuelle et commissions des encaisseurs'
          />

          <div className='flex flex-wrap items-end justify-between gap-4'>
            <div className='flex flex-wrap items-end gap-4'>
              <div className='space-y-2 w-full sm:w-56'>
                <Select value={vue} onValueChange={(v) => setVue(v as 'rapport' | 'prime')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='rapport'>Rapport annuel par encaisseur</SelectItem>
                    <SelectItem value='prime'>Prime du mois (tous encaisseurs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2 w-full sm:w-40'>
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

              {vue === 'prime' && (
                <div className='space-y-2 w-full sm:w-48'>
                  <Select value={mois} onValueChange={setMois}>
                    <SelectTrigger>
                      <SelectValue placeholder='Mois' />
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
              )}

              {vue === 'rapport' && (
                <div className='space-y-2 w-full sm:w-56'>
                  <Select value={noEncaisseur} onValueChange={setNoEncaisseur}>
                    <SelectTrigger>
                      <SelectValue placeholder='Encaisseur' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>Sélectionner un encaisseur</SelectItem>
                      {encaisseurs.map((e) => (
                        <SelectItem key={e.numero} value={String(e.numero)}>
                          {e.designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
          </div>
        </div>

        <div className='mt-6'>
        {loading ? (
          <div className='text-center text-sm text-gray-500 py-10'>Chargement...</div>
        ) : vue === 'rapport' ? (
          noEncaisseur === '0' ? (
            <div className='text-center text-sm text-gray-500 py-10'>Sélectionnez un encaisseur.</div>
          ) : !rapportEncaisseur || rapportEncaisseur.lignes.length === 0 ? (
            <div className='text-center text-sm text-gray-500 py-10'>Aucune donnée pour cette année.</div>
          ) : (
            <div className='border rounded-lg overflow-x-auto mt-4'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='text-left text-gray-500 border-b'>
                    <th className='py-2 px-4 font-medium'>Mois</th>
                    <th className='py-2 px-4 font-medium text-right'>Émissions (MAD)</th>
                    <th className='py-2 px-4 font-medium text-right'>Encaissement (MAD)</th>
                    <th className='py-2 px-4 font-medium text-right'>Taux d'Encaissement</th>
                    <th className='py-2 px-4 font-medium text-center'>Nombre de Facture</th>
                  </tr>
                </thead>
                <tbody>
                  {rapportEncaisseur.lignes.map((l) => (
                    <tr key={l.mois} className='border-b last:border-b-0'>
                      <td className='py-2 px-4 font-medium'>{MOIS.find((m) => m.value === l.mois)?.label}</td>
                      <td className='py-2 px-4 text-right'>{fmtMontant(l.emissions)}</td>
                      <td className='py-2 px-4 text-right'>{fmtMontant(l.encaissement)}</td>
                      <td className='py-2 px-4 text-right'>{l.tauxEncaissement.toFixed(2)}%</td>
                      <td className='py-2 px-4 text-center'>{l.nbFactures}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className='bg-primary/5 font-bold'>
                    <td className='py-3 px-4'>Total</td>
                    <td className='py-3 px-4 text-right'>{fmtMontant(rapportEncaisseur.totalEmissions)}</td>
                    <td className='py-3 px-4 text-right'>{fmtMontant(rapportEncaisseur.totalEncaissement)}</td>
                    <td className='py-3 px-4 text-right'>{rapportEncaisseur.tauxGlobal.toFixed(2)}%</td>
                    <td className='py-3 px-4' />
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        ) : !primeEncaisseur || primeEncaisseur.lignes.length === 0 ? (
          <div className='text-center text-sm text-gray-500 py-10'>Aucune donnée pour cette période.</div>
        ) : (
          <div className='border rounded-lg overflow-x-auto mt-4'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-gray-500 border-b'>
                  <th className='py-2 px-4 font-medium'>Encaisseur</th>
                  <th className='py-2 px-4 font-medium text-center'>Factures Mois</th>
                  <th className='py-2 px-4 font-medium text-center'>Factures Mois-1</th>
                  <th className='py-2 px-4 font-medium text-right'>Émission</th>
                  <th className='py-2 px-4 font-medium text-right'>Encaissement</th>
                  <th className='py-2 px-4 font-medium text-right'>Taux</th>
                  <th className='py-2 px-4 font-medium text-right'>Forfait</th>
                  <th className='py-2 px-4 font-medium text-right'>Bonus</th>
                  <th className='py-2 px-4 font-medium text-right'>Total Prime</th>
                </tr>
              </thead>
              <tbody>
                {primeEncaisseur.lignes.map((l) => (
                  <tr key={l.noEncaisseur} className='border-b last:border-b-0'>
                    <td className='py-2 px-4 font-medium'>{l.encaisseur || '-'}</td>
                    <td className='py-2 px-4 text-center'>{l.nbFacturesMoisCourant}</td>
                    <td className='py-2 px-4 text-center'>{l.nbFacturesMoisPrecedent}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(l.emission)}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(l.encaissement)}</td>
                    <td className='py-2 px-4 text-right'>{l.pourcentage != null ? `${l.pourcentage.toFixed(2)}%` : '-'}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(l.primeForfait)}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(l.bonus)}</td>
                    <td className='py-2 px-4 text-right font-semibold'>{fmtMontant(l.totalPrime)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className='bg-primary/5 font-bold'>
                  <td className='py-3 px-4' colSpan={8}>
                    Total général
                  </td>
                  <td className='py-3 px-4 text-right'>{fmtMontant(primeEncaisseur.totalPrime)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RapportEncaisseur;
