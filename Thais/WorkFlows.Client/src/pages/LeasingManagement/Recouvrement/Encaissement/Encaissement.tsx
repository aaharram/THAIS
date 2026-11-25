import { ExportTiles } from '@/components/export/export-tiles';
import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { PaiementResponse, RapportComptableLigne } from '@/store/features/leasing/paiement-schemas';
import {
  demanderAnnulationPaiement,
  genererRapportComptable,
  getPaiements,
  getPaiementsTotal,
  importerRemisePaiements,
  ImporterRemiseResponse,
} from '@/store/features/leasing/paiementsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Ban, Download, FileBarChart, Receipt, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const EXPORT_HEADER = ['N°', 'Locataire', 'Actif', 'Montant (MAD)', 'Date Encaissement', 'Mode Paiement', 'Référence', 'Encaisseur', 'N° Remise Bancaire'];

const RAPPORT_HEADER = [
  'Date Comptable', 'Type', 'Code Intermédiaire', 'Nom payeur', 'Libellé opération', 'Montant',
  'Date Encaiss/Vir/Cheq/Effet', 'Référence paiment', 'Banque virement/Versement', 'Ville chèque',
  'Compte chèque/eff/virt (encaissement)', 'Nature', 'Direction', 'Code service',
  'Compte Comptable (piece comptable)', 'Sous-compte comptable(piece comptable)',
  'Banque versement chèque/effet/virt', 'AGENCE', 'Compte verst/chq/ effet/vir',
  'LETTRAGE COMPENSATION', 'REF BX', 'Nom Encaisseur', 'Num Remise Bancaire',
];

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const ANNEES = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Encaissement = () => {
  const dispatch = useAppDispatch();
  const {
    historique: allItems,
    historiqueTotalCount: totalCount,
    historiquePageNumber: pageNumber,
    historiquePageSize: pageSize,
    historiqueTotalMontant: totalMontant,
    loading,
  } = useAppSelector((state) => state.paiements);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const { allItems: encaisseurs } = useAppSelector((state) => state.cfgEncaisseurs);

  const [search, setSearch] = useState('');
  const [noProprietaire, setNoProprietaire] = useState('0');
  const [noEncaisseur, setNoEncaisseur] = useState('0');
  const [annee, setAnnee] = useState(String(new Date().getFullYear()));
  const [mois, setMois] = useState('0');
  const [annulationDialogItem, setAnnulationDialogItem] = useState<PaiementResponse | null>(null);
  const [annulationLoading, setAnnulationLoading] = useState(false);

  const [remiseModalOpen, setRemiseModalOpen] = useState(false);
  const [remiseFile, setRemiseFile] = useState<File | null>(null);
  const [remiseImportLoading, setRemiseImportLoading] = useState(false);
  const [remiseImportResult, setRemiseImportResult] = useState<ImporterRemiseResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rapportDialogOpen, setRapportDialogOpen] = useState(false);
  const [rapportLoading, setRapportLoading] = useState(false);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgEncaisseurs.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  const fetchList = (page: number, size: number) => {
    dispatch(
      getPaiements({
        pageNumber: page,
        pageSize: size,
        search,
        noProprietaire: Number(noProprietaire) || undefined,
        noEncaisseur: Number(noEncaisseur) || undefined,
        annee: Number(annee) || undefined,
        mois: Number(mois) || undefined,
      }),
    );
  };

  useEffect(() => {
    fetchList(1, pageSize);
    dispatch(
      getPaiementsTotal({
        search,
        noProprietaire: Number(noProprietaire) || undefined,
        noEncaisseur: Number(noEncaisseur) || undefined,
        annee: Number(annee) || undefined,
        mois: Number(mois) || undefined,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, search, noProprietaire, noEncaisseur, annee, mois]);

  const confirmDemanderAnnulation = async () => {
    if (!annulationDialogItem) return;
    setAnnulationLoading(true);
    try {
      await dispatch(demanderAnnulationPaiement(annulationDialogItem.numero)).unwrap();
      setAnnulationDialogItem(null);
      fetchList(pageNumber, pageSize);
    } finally {
      setAnnulationLoading(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportRows = () =>
    allItems.map((p) => [
      `ENC${p.numero}`,
      p.nomLocataire || '-',
      p.nomBuilding || '-',
      fmtMontant(p.montant),
      fmtDate(p.datePaiement),
      p.modePaiement,
      p.reference || '-',
      p.nomEncaisseur || '-',
      p.numRemiseBancaire || '-',
    ]);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Encaissement');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Encaissement-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Encaissement', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
    });
    doc.save(`Encaissement-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // RMANew (Classes/ListEncaissement.vb, ImportExcelHeader = "RefPaiement,NumRemiseBancaire") :
  // le modèle d'import ne comporte que ces deux colonnes.
  const handleDownloadRemiseTemplate = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('RemiseBancaire');
    sheet.addRow(['RefPaiement', 'NumRemiseBancaire']).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      'Modele-Remise-Bancaire.xlsx',
    );
  };

  const handleImportRemiseFile = async () => {
    if (!remiseFile) return;
    setRemiseImportLoading(true);
    setRemiseImportResult(null);
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await remiseFile.arrayBuffer());
      const sheet = workbook.worksheets[0];

      const lignes: { refPaiement: string; numRemiseBancaire: string }[] = [];
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // en-tête
        const refPaiement = row.getCell(1).text?.trim();
        const numRemiseBancaire = row.getCell(2).text?.trim();
        if (refPaiement && numRemiseBancaire) {
          lignes.push({ refPaiement, numRemiseBancaire });
        }
      });

      const result = await dispatch(importerRemisePaiements(lignes)).unwrap();
      setRemiseImportResult(result);
      fetchList(pageNumber, pageSize);
    } finally {
      setRemiseImportLoading(false);
    }
  };

  const closeRemiseModal = () => {
    setRemiseModalOpen(false);
    setRemiseFile(null);
    setRemiseImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // RMANew (Classes/ListEncaissement.vb, GenereEncaissement) : génère l'export comptable au
  // format fixe pour les encaissements du filtre courant non encore exportés, puis les
  // marque comme générés côté serveur (ils ne seront plus réinclus la prochaine fois).
  const handleGenererRapportComptable = async () => {
    setRapportLoading(true);
    try {
      const result = await dispatch(
        genererRapportComptable({
          annee: Number(annee) || undefined,
          mois: Number(mois) || undefined,
          noProprietaire: Number(noProprietaire) || undefined,
        }),
      ).unwrap();

      if (result.lignes.length > 0) {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Fichier Encaissement');
        sheet.addRow(RAPPORT_HEADER).font = { bold: true };
        result.lignes.forEach((l: RapportComptableLigne) =>
          sheet.addRow([
            l.dateComptable, l.type, l.codeIntermediaire, l.nomPayeur, l.libelleOperation, l.montant,
            l.dateEncaissVirChequeEffet, l.referencePaiement, l.banqueVirementVersement, l.villeCheque,
            l.compteChequeEffetVirt, l.nature, l.direction, l.codeService, l.comptePieceComptable,
            l.sousComptePieceComptable, l.banqueVersementChequeEffetVirt, l.agence,
            l.comptevermtChqEffetVir, l.lettrageCompensation, l.refBx, l.nomEncaisseur, l.numRemiseBancaire,
          ]),
        );
        sheet.columns.forEach((column) => {
          column.width = 18;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        downloadBlob(
          new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
          `Fichier-Encaissement-${new Date().toISOString().slice(0, 10)}.xlsx`,
        );
      }

      setRapportDialogOpen(false);
      fetchList(pageNumber, pageSize);
    } finally {
      setRapportLoading(false);
    }
  };

  const columns: ColumnDef<PaiementResponse>[] = [
    {
      accessorKey: 'numero',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N°' sorting />,
      cell: ({ row }) => <div className='font-medium'>ENC{row.original.numero}</div>,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocataire || '-'}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'montant',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Encaissement (MAD)' />,
      cell: ({ row }) => <div className='font-bold text-green-700'>{fmtMontant(row.original.montant)}</div>,
    },
    {
      id: 'datePaiement',
      accessorFn: (row) => fmtDate(row.datePaiement),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Encaissement' sorting />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.datePaiement)}</div>,
    },
    {
      accessorKey: 'modePaiement',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Mode Paiement' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.modePaiement}</div>,
    },
    {
      accessorKey: 'reference',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Référence' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.reference || '-'}</div>,
    },
    {
      accessorKey: 'nomEncaisseur',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Encaisseur' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomEncaisseur || '-'}</div>,
    },
    {
      accessorKey: 'numRemiseBancaire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° Remise Bancaire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numRemiseBancaire || '-'}</div>,
    },
    {
      id: 'statut',
      header: () => <div className='text-center'>Statut</div>,
      cell: ({ row }) => {
        const { annule, rejete, demandeAnnulation } = row.original;
        const label = annule ? 'Annulé' : rejete ? 'Rejeté' : demandeAnnulation ? "Demande d'annulation" : 'Actif';
        const badgeClass =
          annule || rejete
            ? 'text-red-700 bg-red-100'
            : demandeAnnulation
              ? 'text-amber-700 bg-amber-100'
              : 'text-green-700 bg-green-100';
        return (
          <div className='flex justify-center'>
            <span
              className={`inline-block w-fit text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${badgeClass}`}
            >
              {label}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          {!row.original.annule && !row.original.rejete && !row.original.demandeAnnulation && (
            <Button
              size='sm'
              variant='outline'
              className='text-red-600 hover:text-red-700'
              onClick={() => setAnnulationDialogItem(row.original)}
            >
              <Ban className='h-4 w-4 mr-2' />
              Annuler
            </Button>
          )}
        </div>
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => fetchList(newPage + 1, pageSize),
    onPageSizeChange: (newSize: number) => fetchList(1, newSize),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Title icon={Receipt} title='Encaissement' description='Consultation des encaissements enregistrés' />
            <div className='rounded-md bg-green-50 px-4 py-2 text-sm font-semibold text-green-700'>
              Total {annee !== '0' ? annee : 'toutes années'} : {fmtMontant(totalMontant)} MAD
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomLocataire', title: 'Locataire' }]}
          onSearchChange={setSearch}
          isLoading={loading}
          pagination={pagination}
          toolbar={
            <div className='flex flex-wrap items-center gap-2'>
              <div className='w-full sm:w-44'>
                <Select value={noProprietaire} onValueChange={setNoProprietaire}>
                  <SelectTrigger className='h-8'>
                    <SelectValue placeholder='Tous les propriétaires' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Tous les propriétaires</SelectItem>
                    {proprietaires.map((p) => (
                      <SelectItem key={p.numero} value={p.numero.toString()}>
                        {p.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='w-full sm:w-40'>
                <Select value={annee} onValueChange={setAnnee}>
                  <SelectTrigger className='h-8'>
                    <SelectValue placeholder='Année' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Toutes les années</SelectItem>
                    {ANNEES.map((a) => (
                      <SelectItem key={a} value={String(a)}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='w-full sm:w-40'>
                <Select value={mois} onValueChange={setMois}>
                  <SelectTrigger className='h-8'>
                    <SelectValue placeholder='Mois' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Tous les mois</SelectItem>
                    {MOIS.map((m, i) => (
                      <SelectItem key={m} value={String(i + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='w-full sm:w-44'>
                <Select value={noEncaisseur} onValueChange={setNoEncaisseur}>
                  <SelectTrigger className='h-8'>
                    <SelectValue placeholder='Choix Encaisseur' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Choix Encaisseur</SelectItem>
                    {encaisseurs.map((e) => (
                      <SelectItem key={e.numero} value={e.numero.toString()}>
                        {e.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type='button'
                size='icon'
                className='h-9 w-9 bg-teal-600 hover:bg-teal-700'
                title='Charger Remise bancaire'
                onClick={() => setRemiseModalOpen(true)}
              >
                <Upload className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                size='icon'
                className='h-9 w-9 bg-blue-700 hover:bg-blue-800'
                title='Rapport Comptable Encaissement'
                onClick={() => setRapportDialogOpen(true)}
              >
                <FileBarChart className='h-4 w-4' />
              </Button>
              <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
            </div>
          }
        />
      </CardContent>

      <BaseDialog
        open={!!annulationDialogItem}
        onOpenChange={(open) => !open && setAnnulationDialogItem(null)}
        title="Demander l'annulation"
        description={
          annulationDialogItem
            ? `Envoyer une demande d'annulation pour ENC${annulationDialogItem.numero} (${annulationDialogItem.nomLocataire ?? ''}) ? L'encaissement restera actif jusqu'à confirmation.`
            : undefined
        }
        onCancel={() => setAnnulationDialogItem(null)}
        onConfirm={confirmDemanderAnnulation}
        confirmText='Demander'
        loading={annulationLoading}
      />

      <BaseDialog
        open={remiseModalOpen}
        onOpenChange={(open) => !open && closeRemiseModal()}
        title='Charger Remise bancaire'
        description="Fichier à 2 colonnes (RefPaiement, NumRemiseBancaire) : chaque encaissement dont la référence correspond est associé à la remise indiquée."
        onCancel={closeRemiseModal}
        onConfirm={handleImportRemiseFile}
        confirmText='Importer'
        loading={remiseImportLoading}
      >
        <div className='space-y-4'>
          <Button type='button' variant='outline' className='gap-2' onClick={handleDownloadRemiseTemplate}>
            <Download className='h-4 w-4' />
            Télécharger le modèle
          </Button>
          <div className='space-y-2'>
            <Label htmlFor='remiseFile'>Fichier à importer (.xlsx)</Label>
            <Input
              id='remiseFile'
              type='file'
              accept='.xlsx,.xls'
              ref={fileInputRef}
              onChange={(e) => setRemiseFile(e.target.files?.[0] ?? null)}
            />
          </div>
          {remiseImportResult && (
            <div className='rounded-md bg-muted p-3 text-sm space-y-1'>
              <p className='font-medium text-green-700'>
                {remiseImportResult.nombreAssocies} encaissement(s) associé(s).
              </p>
              {remiseImportResult.referencesIntrouvables.length > 0 && (
                <p className='text-amber-700'>
                  Références introuvables : {remiseImportResult.referencesIntrouvables.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      </BaseDialog>

      <BaseDialog
        open={rapportDialogOpen}
        onOpenChange={(open) => !open && setRapportDialogOpen(false)}
        title='Rapport Comptable Encaissement'
        description={`Générer et télécharger le fichier comptable des encaissements du filtre courant (${annee !== '0' ? annee : 'toutes années'}${mois !== '0' ? ` / ${MOIS[Number(mois) - 1]}` : ''}) non encore exportés ? Ils seront marqués comme exportés et ne réapparaîtront plus dans un prochain rapport.`}
        onCancel={() => setRapportDialogOpen(false)}
        onConfirm={handleGenererRapportComptable}
        confirmText='Générer'
        loading={rapportLoading}
      />
    </Card>
  );
};

export default Encaissement;
