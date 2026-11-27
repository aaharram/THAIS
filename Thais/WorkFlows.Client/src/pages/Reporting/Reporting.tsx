import { BaseDialog } from '@/components/dialog/dialog';
import { Button } from '@/components/ui/button';
import { HubCardGrid } from '@/components/ui/hub-card-grid';
import { Title } from '@/components/ui/title';
import { EtatContentieuxResponse } from '@/store/features/leasing/etat-contentieux-schemas';
import { EtatRejetResponse } from '@/store/features/leasing/etat-rejet-schemas';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import {
  ArrowLeftRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  CalendarClock,
  CircleX,
  DoorOpen,
  FilePlus,
  FileWarning,
  FileX,
  Gavel,
  HandCoins,
  History,
  Scale,
  TrendingUp,
  UserSearch,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

// RMANew (ViewReporting.aspx) : hub de rapports comptables/financiers, ~27 sous-rapports.
// Migration par lots : d'abord les tuiles couvertes par des pages déjà existantes (liens
// directs, aucun nouveau développement), puis les rapports manquants à entité existante,
// puis les modules métier sans backend (Encaisseur, CPC Immobilier, État Impayé...),
// et enfin le journal comptable / interface SmartStream (le plus volumineux).
const items = [
  {
    key: 'revisions-loyers',
    name: 'Révision Loyer',
    icon: TrendingUp,
    link: '/reporting/revision-loyer',
    description: 'Historique de toutes les révisions de loyer, export Excel/PDF',
    enabled: true,
  },
  {
    key: 'annulations-quittances',
    name: 'Etat Annulation des Quittances',
    icon: FileX,
    link: '/archives/annulations-quittances?from=reporting',
    description: 'Quittances (factures) annulées, export PDF',
    enabled: true,
  },
  {
    key: 'etat-des-loyers',
    name: 'Etat des loyers Comptables',
    icon: BookOpenCheck,
    link: '/reporting/etat-des-loyers',
    description: 'Loyers facturés vs encaissés par actif et par année',
    enabled: true,
  },
  {
    key: 'historique-etat-des-loyers',
    name: 'Historique Etat des loyers',
    icon: History,
    link: '/reporting/etat-des-loyers/historique',
    description: 'Instantanés validés des états des loyers passés',
    enabled: true,
  },
  {
    key: 'etat-par-immeuble',
    name: 'Etat des loyers / Actif',
    icon: Building2,
    link: '/reporting/etat-par-immeuble',
    description: 'État comptable détaillé par immeuble',
    enabled: true,
  },
  {
    key: 'impayes-par-age',
    name: 'Etat des loyers impayés par période',
    icon: CalendarClock,
    link: '/reporting/impayes-par-age',
    description: 'Répartition des impayés par tranche d\'ancienneté',
    enabled: true,
  },
  {
    key: 'etat-impaye',
    name: 'Etat Impayé',
    icon: FileWarning,
    link: '/reporting/etat-impaye',
    description: 'Montants impayés courants, consolidés par propriétaire',
    enabled: true,
  },
  {
    key: 'suivi-impaye',
    name: 'Suivi Impayé',
    icon: UserSearch,
    link: '/reporting/suivi-impaye',
    description: 'Détail des impayés par locataire, filtrable par Encaisseur',
    enabled: true,
  },
  {
    key: 'liste-dossiers-contentieux',
    name: 'Liste Dossiers en Contentieux',
    icon: Gavel,
    link: '/reporting/suivi-impaye?etat=contentieux',
    description: 'Dossiers en contentieux uniquement, avec totaux',
    enabled: true,
  },
  {
    key: 'apercu-emissions-encaissement',
    name: 'Etat globale Emissions / Encaissements',
    icon: ArrowLeftRight,
    link: '/reporting/apercu-emissions-encaissement',
    description: 'Résumé global du mois : loyers facturés vs encaissés',
    enabled: true,
  },
  {
    key: 'suivi-encaissement',
    name: 'Suivi Encaissement',
    icon: HandCoins,
    link: '/reporting/suivi-encaissement',
    description: 'Détail des encaissements par immeuble',
    enabled: true,
  },
  {
    key: 'locaux-vacants',
    name: 'Liste Locaux vacants',
    icon: DoorOpen,
    link: '/reporting/locaux-vacants',
    description: 'Locaux sans bail en cours, filtrables par Propriétaire',
    enabled: true,
  },
  {
    key: 'nouveaux-baux',
    name: 'Etat des Nouveaux Baux',
    icon: FilePlus,
    link: '/reporting/nouveaux-baux',
    description: "Baux signés dans l'année, export Excel/PDF",
    enabled: true,
  },
  {
    key: 'etat-rejet',
    name: 'Etat de rejet',
    icon: CircleX,
    link: '',
    description: 'Encaissements rejetés, export Excel direct',
    enabled: true,
    isDownload: true,
  },
  {
    key: 'etat-contentieux',
    name: 'Etat de contentieux',
    icon: Scale,
    link: '',
    description: 'Baux en contentieux, export Excel direct',
    enabled: true,
    isDownload: true,
  },
];

type DownloadKey = 'etat-rejet' | 'etat-contentieux';

const DOWNLOAD_LABELS: Record<DownloadKey, string> = {
  'etat-rejet': 'Etat de rejet',
  'etat-contentieux': 'Etat de contentieux',
};

const EXPORT_HEADER_REJET = [
  'Numero',
  'Imputation',
  'Montant',
  'Banque',
  'N°réf paiement',
  'Libellé',
  'Locataire',
  'Compte',
  'Sous compte',
  'VI',
  'Nom Encaisseur',
  'Date Rejet',
];

const EXPORT_HEADER_CONTENTIEUX = [
  'Date Debut Contentieux',
  'Locataires',
  'Immeuble',
  'Ville',
  'Sous-compte',
  'Compte',
  'Date résiliation',
  'Loyer mensuel',
  `Solde ${new Date().getFullYear() - 1}`,
  `Emissions ${new Date().getFullYear()}`,
  `Réglements ${new Date().getFullYear()}`,
  'Solde Actuel',
];

const fmtDateRejet = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

const Reporting = () => {
  const navigate = useNavigate();
  const [activeDownload, setActiveDownload] = useState<DownloadKey | null>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const buildWorkbook = async (sheetName: string, header: string[], rows: (string | number)[][]) => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);
    sheet.addRow(header).font = { bold: true };
    rows.forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 18;
    });
    return workbook.xlsx.writeBuffer();
  };

  const downloadEtatRejet = async () => {
    const { data } = await api.get<EtatRejetResponse[]>(`${API_BASE_URL}/api/paiements/etat-rejet`);
    const buffer = await buildWorkbook(
      'Etat de rejet',
      EXPORT_HEADER_REJET,
      data.map((r) => [
        `ENC${r.numero}`,
        fmtDateRejet(r.datePaiement),
        r.montant,
        '-',
        r.reference || '-',
        'Rejet',
        r.nomLocataire || '-',
        r.numContratLocations || '-',
        r.compteGeneral || '-',
        r.codeImmeuble || '-',
        r.nomEncaisseur || '-',
        fmtDateRejet(r.dateRejet),
      ]),
    );
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Etat de rejet ${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`,
    );
  };

  const downloadEtatContentieux = async () => {
    const { data } = await api.get<EtatContentieuxResponse[]>(`${API_BASE_URL}/api/suivi-contentieux/etat-contentieux`);
    const buffer = await buildWorkbook(
      'Etat contentieux',
      EXPORT_HEADER_CONTENTIEUX,
      data.map((r) => [
        fmtDateRejet(r.dateDebutContentieux),
        r.nomLocataire || '-',
        r.nomBuilding || '-',
        r.ville || '-',
        r.compteGeneral || '-',
        r.numContratLocations || '-',
        r.enCours ? 'En Cours' : fmtDateRejet(r.dateResiliation),
        r.loyerMensuel ?? 0,
        r.soldeAnneePrecedente ?? 0,
        r.emissionsAnneeCourante,
        r.reglementsAnneeCourante,
        r.soldeActuel,
      ]),
    );
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Etat de contentieux ${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`,
    );
  };

  const confirmDownload = async () => {
    if (!activeDownload) return;
    setDownloading(true);
    try {
      if (activeDownload === 'etat-rejet') await downloadEtatRejet();
      else await downloadEtatContentieux();
      setActiveDownload(null);
    } finally {
      setDownloading(false);
    }
  };

  const handleCardClick = (item: (typeof items)[number]) => {
    if (!item.enabled) return;
    if ('isDownload' in item && item.isDownload) {
      setActiveDownload(item.key as DownloadKey);
      return;
    }
    navigate(item.link);
  };

  return (
    <div className='space-y-4'>
      <Title icon={BarChart3} title='Reporting' description='Rapports de gestion locative' />

      <HubCardGrid
        iconStrokeWidth={1.5}
        items={items.map((item) => ({ ...item, onClick: () => handleCardClick(item) }))}
      />

      <BaseDialog
        open={activeDownload !== null}
        onOpenChange={(open) => !open && setActiveDownload(null)}
        title='Confirmation'
        description={activeDownload ? `Voulez-vous télécharger le fichier « ${DOWNLOAD_LABELS[activeDownload]} » ?` : ''}
      >
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => setActiveDownload(null)} disabled={downloading}>
            Annuler
          </Button>
          <Button onClick={confirmDownload} disabled={downloading}>
            {downloading ? 'Téléchargement...' : 'Confirmer'}
          </Button>
        </div>
      </BaseDialog>
    </div>
  );
};

export default Reporting;
