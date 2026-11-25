import { BaseDialog } from '@/components/dialog/dialog';
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
import { MOIS } from '@/store/features/leasing/etat-loyer-schemas';
import {
  CompteComptableJournalRequest,
  JournalComptableGeneration,
  JournalComptableLigne,
  JournalComptableResponse,
  TYPES_JOURNAL,
} from '@/store/features/leasing/journal-comptable-schemas';
import {
  createCompteComptableJournal,
  deleteCompteComptableJournal,
  editCompteComptableJournal,
  genererJournalComptable,
  getComptesComptableJournal,
  getJournalComptable,
  getJournalComptableHistorique,
} from '@/store/features/leasing/journalComptableSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Download, FileClock, Plus, Settings2, Trash2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

// RMANew (JournalSqComptable.vb, fonctions SMartStrmExport*) : export plat SmartStream,
// 21 colonnes, 3-4 lignes par facture (ventilation TVA sur des comptes câblés en dur,
// ex: 732110/732120/445210) et 8 jrnl_id différents selon le type d'écriture. Le modèle de
// données de Smart-Building a délibérément simplifié cette ventilation à 1 ligne débit +
// 1 ligne crédit par transaction (voir JournalComptableService) - cet export reprend donc
// cette même structure simplifiée dans le format de colonnes SmartStream, plutôt que de
// reconstruire la ventilation TVA à 3-4 lignes qui n'a pas d'équivalent dans le modèle
// actuel. "ldr_entity_id"/"div" restent les constantes fixes du legacy (identifiants du
// grand livre SmartStream, pas des comptes métier) ; jrnl_id substitue le type de journal
// (les 8 codes 8101-8108 du legacy étaient spécifiques à sa ventilation à 4 lignes, sans
// correspondance directe ici) ; les colonnes sans équivalent dans le modèle actuel
// (catwat/e7/e8/e9, misc_dr_cr_code/misc_amt) sont laissées vides plutôt qu'inventées.
const SMARTSTREAM_HEADER = [
  'ldr_entity_id',
  'jrnl_id',
  'eff_date',
  'jrnl_seq_nbr',
  'jrnl_line_nbr',
  'line_ldr_entity_id',
  'div',
  'cpte',
  'sscpte',
  'centre',
  'catmin',
  'catwat',
  'e7',
  'e8',
  'e9',
  'trans_amt',
  'prim_dr_cr_code',
  'misc_dr_cr_code',
  'misc_amt',
  'jrnl_user_alpha_fld_2',
  'jrnl_user_alpha_fld_3',
  'descp',
];

const ANNEES = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const typeLabel = (t: string) => TYPES_JOURNAL.find((x) => x.value === t)?.label ?? t;

const csvEscape = (v: string) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v);

const buildSmartStreamContent = (
  lignes: JournalComptableLigne[],
  typeJournal: string,
  annee: number,
  mois: number,
) => {
  const effDate = new Date(annee, mois, 0).toLocaleDateString('fr-FR');
  const rows = lignes.map((l) =>
    [
      'ALWAT',
      typeJournal,
      effDate,
      '',
      String(l.jrnlLineNbr),
      'ALWAT',
      'I',
      l.compte ?? '',
      l.sousCompte ?? '',
      l.centre ?? '',
      l.catmin ?? '',
      '',
      '',
      '',
      '',
      l.transAmt.toFixed(2),
      l.sensDrCr,
      '',
      '',
      String(l.noBuilding),
      '',
      csvEscape(l.descp ?? ''),
    ].join(','),
  );

  return [SMARTSTREAM_HEADER.join(','), ...rows].join('\r\n');
};

const downloadTxt = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const emptyCompte: CompteComptableJournalRequest = {
  typeJournal: TYPES_JOURNAL[0].value,
  typeSequenceComptable: 'ADMIS',
  compteDebit: '',
  compteCredit: '',
  sousCompte: '',
  description: '',
};

const JournalComptable = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const { journal, historique, comptes, loading, generating } = useAppSelector((state) => state.journalComptable);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const [searchParams] = useSearchParams();

  const [vue, setVue] = useState<'journal' | 'historique' | 'comptes'>(
    searchParams.get('vue') === 'historique' ? 'historique' : 'journal',
  );
  const [annee, setAnnee] = useState(String(new Date().getFullYear()));
  const [mois, setMois] = useState(String(new Date().getMonth() + 1));
  const [noProprietaire, setNoProprietaire] = useState('0');
  const [typeJournal, setTypeJournal] = useState<string>(TYPES_JOURNAL[0].value);
  const [genererDialogOpen, setGenererDialogOpen] = useState(false);

  const [compteDialogOpen, setCompteDialogOpen] = useState(false);
  const [compteEditId, setCompteEditId] = useState<number | null>(null);
  const [compteForm, setCompteForm] = useState<CompteComptableJournalRequest>(emptyCompte);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    dispatch(getComptesComptableJournal());
  }, [dispatch]);

  useEffect(() => {
    if (vue === 'journal') {
      dispatch(
        getJournalComptable({
          annee: Number(annee),
          mois: Number(mois),
          noProprietaire: Number(noProprietaire) || undefined,
          typeJournal,
        }),
      );
    } else if (vue === 'historique') {
      dispatch(getJournalComptableHistorique());
    }
  }, [dispatch, vue, annee, mois, noProprietaire, typeJournal]);

  const confirmGenerer = async () => {
    await dispatch(
      genererJournalComptable({
        annee: Number(annee),
        mois: Number(mois),
        noProprietaire: Number(noProprietaire) || undefined,
        typeJournal,
        generePar: userId,
      }),
    ).unwrap();
    setGenererDialogOpen(false);
  };

  const downloadSmartStream = () => {
    if (!journal?.lignes.length) return;

    const content = buildSmartStreamContent(journal.lignes, typeJournal, Number(annee), Number(mois));
    downloadTxt(content, `Smart Stream ${typeLabel(typeJournal)} ${annee}-${mois.padStart(2, '0')}.txt`);
  };

  // RMANew (HistoriqueJournalSqComptable.vb) : grille période x 5 types, chaque cellule un
  // lien de téléchargement vers un fichier déjà généré et stocké sur disque
  // (OrdreGenerationQuittance.EmissionLoyers/...). Ici, plutôt que de stocker des fichiers
  // statiques (couplage fragile à la génération d'origine), chaque cellule régénère et
  // télécharge le SmartStream à la volée pour la période+type de la ligne d'historique
  // cliquée - même résultat pour l'utilisateur, données toujours fraîches.
  const [downloadingHistoriqueId, setDownloadingHistoriqueId] = useState<number | null>(null);
  const downloadHistoriqueCell = async (h: JournalComptableGeneration) => {
    setDownloadingHistoriqueId(h.numero);
    try {
      const params = new URLSearchParams({ annee: String(h.annee), mois: String(h.mois), typeJournal: h.typeJournal });
      if (h.noProprietaire) params.append('noProprietaire', String(h.noProprietaire));
      const { data } = await api.get<JournalComptableResponse>(`${API_BASE_URL}/api/journal-comptable?${params}`);
      const content = buildSmartStreamContent(data.lignes, h.typeJournal, h.annee, h.mois);
      downloadTxt(content, `Smart Stream ${typeLabel(h.typeJournal)} ${h.annee}-${String(h.mois).padStart(2, '0')}.txt`);
    } finally {
      setDownloadingHistoriqueId(null);
    }
  };

  const openCompteDialog = (compte?: (typeof comptes)[number]) => {
    if (compte) {
      setCompteEditId(compte.numero);
      setCompteForm({
        typeJournal: compte.typeJournal,
        typeSequenceComptable: compte.typeSequenceComptable,
        compteDebit: compte.compteDebit,
        compteCredit: compte.compteCredit,
        sousCompte: compte.sousCompte ?? '',
        description: compte.description ?? '',
        addUser: undefined,
        modUser: userId,
      });
    } else {
      setCompteEditId(null);
      setCompteForm({ ...emptyCompte, addUser: userId });
    }
    setCompteDialogOpen(true);
  };

  const submitCompte = async () => {
    if (compteEditId) {
      await dispatch(editCompteComptableJournal({ id: compteEditId, updatedItem: compteForm })).unwrap();
    } else {
      await dispatch(createCompteComptableJournal(compteForm)).unwrap();
    }
    setCompteDialogOpen(false);
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={FileClock}
            title='Journal Comptable'
            description="Génération d'écritures GL (débit/crédit) par période - loyers émis, annulés, encaissés, et leurs équivalents contentieux"
            buttons={[
              {
                label: 'Comptes GL',
                icon: Settings2,
                variant: 'secondary',
                onClick: () => setVue('comptes'),
              },
              {
                label: 'Historique',
                icon: FileClock,
                variant: 'secondary',
                onClick: () => setVue('historique'),
              },
            ]}
          />

          {vue !== 'comptes' && (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Type de journal</Label>
                <Select value={typeJournal} onValueChange={setTypeJournal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES_JOURNAL.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
          )}
        </div>

        {vue === 'journal' && (
          <>
            <div className='flex justify-end gap-2 mt-4'>
              <Button variant='outline' onClick={downloadSmartStream} disabled={loading || !journal?.lignes.length}>
                <Download className='h-4 w-4 mr-2' />
                Télécharger SmartStream (.txt)
              </Button>
              <Button onClick={() => setGenererDialogOpen(true)} disabled={loading || !journal?.lignes.length}>
                Générer (enregistrer dans l'historique)
              </Button>
            </div>

            {journal?.immeublesSansCompte && journal.immeublesSansCompte.length > 0 && (
              <div className='mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3'>
                Comptes GL manquants pour : {journal.immeublesSansCompte.join(', ')} — configurez-les dans « Comptes GL ».
              </div>
            )}

            {loading ? (
              <div className='text-center text-sm text-gray-500 py-10'>Chargement...</div>
            ) : !journal || journal.lignes.length === 0 ? (
              <div className='text-center text-sm text-gray-500 py-10'>Aucune écriture pour cette période.</div>
            ) : (
              <div className='border rounded-lg overflow-x-auto mt-4'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='text-left text-gray-500 border-b'>
                      <th className='py-2 px-4 font-medium'>Ligne</th>
                      <th className='py-2 px-4 font-medium'>Date</th>
                      <th className='py-2 px-4 font-medium'>Actif</th>
                      <th className='py-2 px-4 font-medium'>Centre</th>
                      <th className='py-2 px-4 font-medium'>Catmin</th>
                      <th className='py-2 px-4 font-medium'>Compte</th>
                      <th className='py-2 px-4 font-medium text-center'>Sens</th>
                      <th className='py-2 px-4 font-medium text-right'>Montant</th>
                      <th className='py-2 px-4 font-medium'>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journal.lignes.map((l, idx) => (
                      <tr key={idx} className='border-b last:border-b-0'>
                        <td className='py-2 px-4'>{l.jrnlLineNbr}</td>
                        <td className='py-2 px-4 whitespace-nowrap'>{fmtDate(l.effDate)}</td>
                        <td className='py-2 px-4 font-medium'>{l.immeuble}</td>
                        <td className='py-2 px-4'>{l.centre || '-'}</td>
                        <td className='py-2 px-4'>{l.catmin || '-'}</td>
                        <td className='py-2 px-4'>{l.compte || '-'}</td>
                        <td className='py-2 px-4 text-center'>
                          <span
                            className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              l.sensDrCr === 'D' ? 'text-blue-700 bg-blue-100' : 'text-green-700 bg-green-100'
                            }`}
                          >
                            {l.sensDrCr === 'D' ? 'Débit' : 'Crédit'}
                          </span>
                        </td>
                        <td className='py-2 px-4 text-right font-semibold'>{fmtMontant(l.transAmt)}</td>
                        <td className='py-2 px-4'>{l.descp}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className='bg-primary/5 font-bold'>
                      <td className='py-3 px-4' colSpan={7}>
                        Total
                      </td>
                      <td className='py-3 px-4 text-right'>
                        D {fmtMontant(journal.totalDebit)} / C {fmtMontant(journal.totalCredit)}
                      </td>
                      <td className='py-3 px-4' />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </>
        )}

        {vue === 'historique' &&
          (() => {
            // RMANew (HistoriqueJournalSqComptable.vb) : grille Période x 5 types
            // d'écriture (colonnes fixes), un lien de téléchargement par cellule quand ce
            // type a déjà été généré pour la période - même disposition, filtrée par le
            // Propriétaire sélectionné dans la barre d'outils partagée avec la vue Journal.
            const historiqueFiltree = historique.filter(
              (h) => !Number(noProprietaire) || h.noProprietaire === Number(noProprietaire),
            );
            const periodes = new Map<string, { annee: number; mois: number; parType: Record<string, JournalComptableGeneration> }>();
            historiqueFiltree.forEach((h) => {
              const key = `${h.annee}-${h.mois}`;
              if (!periodes.has(key)) periodes.set(key, { annee: h.annee, mois: h.mois, parType: {} });
              periodes.get(key)!.parType[h.typeJournal] = h;
            });
            const lignesTriees = Array.from(periodes.values()).sort((a, b) => b.annee - a.annee || b.mois - a.mois);

            return (
              <div className='border rounded-lg overflow-x-auto mt-4'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='text-left text-gray-500 border-b'>
                      <th className='py-2 px-4 font-medium'>Période</th>
                      {TYPES_JOURNAL.map((t) => (
                        <th key={t.value} className='py-2 px-4 font-medium text-center'>
                          {t.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lignesTriees.map((p) => (
                      <tr key={`${p.annee}-${p.mois}`} className='border-b last:border-b-0'>
                        <td className='py-2 px-4 font-medium whitespace-nowrap'>
                          {MOIS.find((m) => m.value === p.mois)?.label} {p.annee}
                        </td>
                        {TYPES_JOURNAL.map((t) => {
                          const h = p.parType[t.value];
                          return (
                            <td key={t.value} className='py-2 px-4 text-center'>
                              {h ? (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-8 w-8 p-0'
                                  title={`Télécharger (${h.nbLignes} lignes, ${fmtMontant(h.montantTotal)})`}
                                  disabled={downloadingHistoriqueId === h.numero}
                                  onClick={() => downloadHistoriqueCell(h)}
                                >
                                  <Download className='h-4 w-4' />
                                </Button>
                              ) : (
                                <span className='text-gray-300'>-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {lignesTriees.length === 0 && (
                      <tr>
                        <td colSpan={TYPES_JOURNAL.length + 1} className='py-4 px-4 text-center text-gray-400'>
                          Aucune génération enregistrée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}

        {vue === 'comptes' && (
          <div className='mt-4 space-y-4'>
            <div className='flex justify-between items-center'>
              <p className='text-sm text-gray-500'>
                Comptes GL par type de journal et séquence comptable (ADMIS/LIBRE) — valeurs reprises du legacy, à
                valider avec la comptabilité.
              </p>
              <Button onClick={() => openCompteDialog()}>
                <Plus className='h-4 w-4 mr-1' /> Ajouter
              </Button>
            </div>
            <div className='border rounded-lg overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='text-left text-gray-500 border-b'>
                    <th className='py-2 px-4 font-medium'>Type Journal</th>
                    <th className='py-2 px-4 font-medium'>Séquence</th>
                    <th className='py-2 px-4 font-medium'>Compte Débit</th>
                    <th className='py-2 px-4 font-medium'>Compte Crédit</th>
                    <th className='py-2 px-4 font-medium'>Description</th>
                    <th className='py-2 px-4 font-medium text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comptes.map((c) => (
                    <tr
                      key={c.numero}
                      className='border-b last:border-b-0 cursor-pointer hover:bg-gray-50'
                      onClick={() => openCompteDialog(c)}
                    >
                      <td className='py-2 px-4 font-medium'>{typeLabel(c.typeJournal)}</td>
                      <td className='py-2 px-4'>{c.typeSequenceComptable}</td>
                      <td className='py-2 px-4'>{c.compteDebit}</td>
                      <td className='py-2 px-4'>{c.compteCredit}</td>
                      <td className='py-2 px-4'>{c.description || '-'}</td>
                      <td className='py-2 px-4 text-right'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0 hover:bg-red-100'
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(deleteCompteComptableJournal(c.numero));
                          }}
                        >
                          <Trash2 className='h-4 w-4 text-red-600' />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <BaseDialog
          open={genererDialogOpen}
          onOpenChange={setGenererDialogOpen}
          title='Confirmer la génération'
          description={`Générer et enregistrer dans l'historique le journal "${typeLabel(typeJournal)}" pour ${MOIS.find((m) => m.value === Number(mois))?.label} ${annee} (${journal?.lignes.length ?? 0} lignes) ?`}
        >
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setGenererDialogOpen(false)} disabled={generating}>
              Annuler
            </Button>
            <Button onClick={confirmGenerer} disabled={generating}>
              {generating ? 'Génération...' : 'Générer'}
            </Button>
          </div>
        </BaseDialog>

        <BaseDialog
          open={compteDialogOpen}
          onOpenChange={setCompteDialogOpen}
          title={compteEditId ? 'Modifier le compte' : 'Ajouter un compte GL'}
        >
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Type de journal</Label>
              <Select
                value={compteForm.typeJournal}
                onValueChange={(v) => setCompteForm((prev) => ({ ...prev, typeJournal: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_JOURNAL.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Séquence comptable</Label>
              <Select
                value={compteForm.typeSequenceComptable}
                onValueChange={(v) => setCompteForm((prev) => ({ ...prev, typeSequenceComptable: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ADMIS'>ADMIS</SelectItem>
                  <SelectItem value='LIBRE'>LIBRE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Compte Débit</Label>
                <Input
                  value={compteForm.compteDebit}
                  onChange={(e) => setCompteForm((prev) => ({ ...prev, compteDebit: e.target.value }))}
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Compte Crédit</Label>
                <Input
                  value={compteForm.compteCredit}
                  onChange={(e) => setCompteForm((prev) => ({ ...prev, compteCredit: e.target.value }))}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Description</Label>
              <Input
                value={compteForm.description ?? ''}
                onChange={(e) => setCompteForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setCompteDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={submitCompte}><Save />{compteEditId ? 'Mettre à jour' : 'Sauvegarder'}</Button>
            </div>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default JournalComptable;
