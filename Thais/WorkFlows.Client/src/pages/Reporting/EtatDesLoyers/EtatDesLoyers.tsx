import { ExportTiles } from '@/components/export/export-tiles';
import { BaseDialog } from '@/components/dialog/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { EtatLoyerResponse, MOIS } from '@/store/features/leasing/etat-loyer-schemas';
import { getEtatLoyer, getPeriodesValidees, validerEtatLoyer } from '@/store/features/leasing/etatLoyerSlice';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { FileClock, FileText, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import EtatLoyerTable from './EtatLoyerTable';

const moisLabel = (m: number) => MOIS.find((x) => x.value === m)?.label ?? String(m);
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

// RMANew (ViewPageEtatdesloyers.aspx, ListEtatdesloyers()) : un seul sélecteur de période
// (au lieu de 2 champs Année/Mois séparés), listant les mois depuis la dernière période
// validée dans les 11 derniers mois (ou 11 mois en arrière si aucune) jusqu'au mois
// courant, chacun marqué "(Validé)" si déjà verrouillé. RMANew scope cette liste par
// Filiale (Propriétaire) - la validation de Smart-Building ne distingue pas par
// propriétaire (validerEtatLoyer n'a pas ce paramètre), donc la liste reste globale.
const buildPeriodeOptions = (periodesValidees: { annee: number; mois: number }[]) => {
  const now = new Date();
  const elevenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const recentValidated = periodesValidees
    .filter((p) => new Date(p.annee, p.mois - 1, 1) >= elevenMonthsAgo)
    .sort((a, b) => b.annee * 12 + b.mois - (a.annee * 12 + a.mois));

  const start = recentValidated[0] ?? { annee: now.getFullYear(), mois: now.getMonth() + 1 };
  const nbMois = now.getFullYear() * 12 + now.getMonth() - (start.annee * 12 + (start.mois - 1));

  const options: { annee: number; mois: number; valide: boolean }[] = [];
  for (let i = 0; i <= nbMois; i++) {
    const totalMonths = start.mois - 1 + i;
    const annee = start.annee + Math.floor(totalMonths / 12);
    const mois = (totalMonths % 12) + 1;
    const valide = periodesValidees.some((p) => p.annee === annee && p.mois === mois);
    options.push({ annee, mois, valide });
  }
  return options.reverse();
};

const EtatDesLoyers = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const { etat, periodesValidees, loading, validating } = useAppSelector((state) => state.etatLoyer);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);

  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [noBuilding, setNoBuilding] = useState('0');
  const [noProprietaire, setNoProprietaire] = useState('0');
  const [validerDialogOpen, setValiderDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 1000 }));
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    dispatch(getPeriodesValidees());
  }, [dispatch]);

  const fetchEtat = () => {
    dispatch(
      getEtatLoyer({
        annee,
        mois,
        noBuilding: Number(noBuilding) || undefined,
        noProprietaire: Number(noProprietaire) || undefined,
      }),
    );
  };

  useEffect(() => {
    fetchEtat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, annee, mois, noBuilding, noProprietaire]);

  const periodeOptions = buildPeriodeOptions(periodesValidees);

  const confirmValider = async () => {
    await dispatch(validerEtatLoyer({ annee, mois, validePar: userId })).unwrap();
    setValiderDialogOpen(false);
    dispatch(getPeriodesValidees());
  };

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

  const periodeLabel = `${moisLabel(mois)} ${annee}`;
  const EXPORT_HEADER = [
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
    if (!etat) return;
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Etat des loyers');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows(etat).forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 22;
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Etat-des-loyers-${moisLabel(mois)}-${annee}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    if (!etat) return;
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text(`Etat des loyers ${moisLabel(mois)} ${annee}`, 14, 14);
    autoTable(doc, { startY: 20, head: [EXPORT_HEADER], body: exportRows(etat), styles: { fontSize: 7 } });
    doc.save(`Etat-des-loyers-${moisLabel(mois)}-${annee}.pdf`);
  };

  // RMANew (TelechargementsEtats.vb, ExportExcelForm -> bouton "Synthèse") : même détail
  // par locataire que l'export standard, mais présenté en blocs groupés par immeuble (un
  // en-tête "Immeuble : X" par bloc, comme la table à l'écran) plutôt qu'en liste plate -
  // c'est ce qui distingue "Synthèse" de "Export" dans le legacy, pas des données différentes.
  const handleExportSynthese = async () => {
    if (!etat) return;
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Synthèse');
    const titleRow = sheet.addRow([`Etat de synthèse - ${moisLabel(mois)} ${annee}`]);
    titleRow.font = { bold: true, size: 14 };
    sheet.addRow([]);

    etat.buildings.forEach((b) => {
      const header = sheet.addRow([`Immeuble : ${b.immeuble}`, b.codeImmeuble ? `Code Immeuble : ${b.codeImmeuble}` : '']);
      header.font = { bold: true };
      const cols = sheet.addRow([
        'Locataire',
        'Sous Compte',
        `Quittance ${periodeLabel}`,
        `Encaissement ${periodeLabel}`,
        'Date limite paiement',
        'Impayé',
        'Nbre Mois Impayé',
      ]);
      cols.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cols.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      });
      b.lignes.forEach((l) =>
        sheet.addRow([
          l.locataire ?? '-',
          b.compteGeneral ?? '-',
          l.revenu,
          l.encaissement,
          fmtDate(l.dateLimitePai),
          l.impaye,
          l.nbMoisImpaye,
        ]),
      );
      sheet.addRow(['Total', '', b.revenuTotal, b.encaissementTotal, '', b.impayeTotal, '']).font = { bold: true };
      sheet.addRow([]);
    });

    sheet.columns.forEach((column) => {
      column.width = 24;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Synthese-Etat-des-loyers-${moisLabel(mois)}-${annee}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={Wallet} title='État des Loyers' description='Loyers facturés vs encaissés par actif et par période' />

          <div className='flex flex-wrap items-end justify-between gap-4'>
            <div className='flex flex-wrap items-end gap-4'>
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

              <div className='space-y-2 w-full sm:w-56'>
                <Select
                  value={`${annee}-${mois}`}
                  onValueChange={(v) => {
                    const [a, m] = v.split('-').map(Number);
                    setAnnee(a);
                    setMois(m);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Valider l'état des loyers" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodeOptions.map((p) => (
                      <SelectItem key={`${p.annee}-${p.mois}`} value={`${p.annee}-${p.mois}`}>
                        {moisLabel(p.mois)} {p.annee}
                        {p.valide ? ' (Validé)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!etat?.valide && (
                <Button
                  onClick={() => setValiderDialogOpen(true)}
                  disabled={loading || noBuilding !== '0' || noProprietaire !== '0'}
                  title={
                    noBuilding !== '0' || noProprietaire !== '0'
                      ? 'La validation porte sur tous les actifs — retirez les filtres pour valider'
                      : undefined
                  }
                >
                  Valider cette période
                </Button>
              )}
            </div>

            <div className='flex items-end gap-2'>
              <Button variant='outline' onClick={() => navigate('/reporting/etat-des-loyers/historique')}>
                <FileClock className='h-4 w-4 mr-2' />
                Historique
              </Button>
              <Button variant='outline' onClick={handleExportSynthese} disabled={!etat?.buildings.length}>
                <FileText className='h-4 w-4 mr-2' />
                Synthèse
              </Button>
              <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
            </div>
          </div>

          {etat?.valide && (
            <div className='flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full w-fit'>
              Période validée{etat.dateValidation ? ` le ${new Date(etat.dateValidation).toLocaleDateString('fr-FR')}` : ''}
            </div>
          )}
        </div>

        <div className='mt-6'>
          {loading ? (
            <div className='text-center text-sm text-gray-500 py-10'>Chargement...</div>
          ) : (
            etat && <EtatLoyerTable etat={etat} />
          )}
        </div>

        <BaseDialog
          open={validerDialogOpen}
          onOpenChange={setValiderDialogOpen}
          title='Confirmer la validation'
          description={`Valider l'état des loyers de ${moisLabel(mois)} ${annee} ? Cette action archive les chiffres actuels et verrouille définitivement la période — elle ne pourra plus être validée à nouveau.`}
        >
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setValiderDialogOpen(false)} disabled={validating}>
              Annuler
            </Button>
            <Button onClick={confirmValider} disabled={validating}>
              {validating ? 'Validation...' : 'Valider'}
            </Button>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default EtatDesLoyers;
