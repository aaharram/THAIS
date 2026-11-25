import { ExportTiles } from '@/components/export/export-tiles';
import { Button } from '@/components/ui/button';
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
import { EtatLoyerResponse, MOIS } from '@/store/features/leasing/etat-loyer-schemas';
import { getHistoriqueEtatLoyer, getPeriodesValidees } from '@/store/features/leasing/etatLoyerSlice';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ArrowLeft, FileClock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import EtatLoyerTable from './EtatLoyerTable';

const moisLabel = (m: number) => MOIS.find((x) => x.value === m)?.label ?? String(m);
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

const HistoriqueEtatDesLoyers = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { historique, periodesValidees, loading } = useAppSelector((state) => state.etatLoyer);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);

  const [periode, setPeriode] = useState('');
  const [noBuilding, setNoBuilding] = useState('0');
  const [noProprietaire, setNoProprietaire] = useState('0');

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 1000 }));
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    dispatch(getPeriodesValidees());
  }, [dispatch]);

  useEffect(() => {
    if (!periode && periodesValidees.length > 0) {
      setPeriode(`${periodesValidees[0].annee}-${periodesValidees[0].mois}`);
    }
  }, [periodesValidees, periode]);

  useEffect(() => {
    if (!periode) return;
    const [annee, mois] = periode.split('-').map(Number);
    dispatch(
      getHistoriqueEtatLoyer({
        annee,
        mois,
        noBuilding: Number(noBuilding) || undefined,
        noProprietaire: Number(noProprietaire) || undefined,
      }),
    );
  }, [dispatch, periode, noBuilding, noProprietaire]);

  const [anneeSel, moisSel] = periode ? periode.split('-').map(Number) : [0, 0];
  const periodeLabel = periode ? `${moisLabel(moisSel)} ${anneeSel}` : '';

  const exportRows = (e: EtatLoyerResponse) =>
    e.buildings.flatMap((b) =>
      b.lignes.map((l) => [
        b.immeuble ?? '-',
        l.locataire ?? '-',
        b.compteGeneral ?? '-',
        String(l.revenu),
        String(l.encaissement),
        fmtDate(l.dateLimitePai),
        String(l.impaye),
        String(l.nbMoisImpaye),
      ]),
    );

  const exportHeader = [
    'Immeuble',
    'Locataire',
    'Sous Compte',
    `Quittance ${periodeLabel}`,
    `Encaissement ${periodeLabel}`,
    'Date limite paiement',
    'Impayé',
    'Nbre Mois Impayé',
  ];

  const handleExportExcel = async () => {
    if (!historique) return;
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Historique Etat des loyers');
    sheet.addRow(exportHeader).font = { bold: true };
    exportRows(historique).forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 22;
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Historique-Etat-des-loyers-${periodeLabel}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    if (!historique) return;
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text(`Historique Etat des loyers ${periodeLabel}`, 14, 14);
    autoTable(doc, { startY: 20, head: [exportHeader], body: exportRows(historique), styles: { fontSize: 7 } });
    doc.save(`Historique-Etat-des-loyers-${periodeLabel}.pdf`);
  };

  return (
    <>
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={FileClock}
            title='Historique — État des Loyers'
            description='Périodes validées (instantané figé au moment de la validation)'
          />

          <div className='flex flex-wrap items-end justify-between gap-4'>
            <div className='flex flex-wrap items-end gap-4'>
              <div className='space-y-2 w-full sm:w-56'>
                <Select value={periode} onValueChange={setPeriode}>
                  <SelectTrigger>
                    <SelectValue placeholder='Période validée' />
                  </SelectTrigger>
                  <SelectContent>
                    {periodesValidees.map((p) => (
                      <SelectItem key={`${p.annee}-${p.mois}`} value={`${p.annee}-${p.mois}`}>
                        {moisLabel(p.mois)} {p.annee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2 w-full sm:w-48'>
                <Select value={noProprietaire} onValueChange={setNoProprietaire}>
                  <SelectTrigger>
                    <SelectValue placeholder='Propriétaire' />
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

              <div className='space-y-2 w-full sm:w-48'>
                <Select value={noBuilding} onValueChange={setNoBuilding}>
                  <SelectTrigger>
                    <SelectValue placeholder='Actif' />
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
            </div>

            <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
          </div>
        </div>

        <div className='mt-6'>
        {!periode ? (
          <div className='text-center text-sm text-gray-500 py-10'>
            Aucune période validée pour le moment.
          </div>
        ) : loading ? (
          <div className='text-center text-sm text-gray-500 py-10'>Chargement...</div>
        ) : (
          historique && <EtatLoyerTable etat={historique} />
        )}

        {!periode && (
          <div className='flex justify-center'>
            <Button variant='outline' onClick={() => navigate('/reporting/etat-des-loyers')}>
              Aller à l'état des loyers en cours
            </Button>
          </div>
        )}
        </div>
      </CardContent>
    </Card>

    <div className='flex justify-end mt-4'>
      <Button variant='secondary' onClick={() => navigate('/reporting/etat-des-loyers')}>
        <ArrowLeft className='h-4 w-4 mr-2' />
        <ArrowLeft />
        Retour
      </Button>
    </div>
    </>
  );
};

export default HistoriqueEtatDesLoyers;
