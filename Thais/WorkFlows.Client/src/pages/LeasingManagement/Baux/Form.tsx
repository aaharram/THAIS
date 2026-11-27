import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/title';
import { AppDispatch, RootState } from '@/store';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import {
  BailRequest,
  BailPieceJointe,
  BailRequestSchema,
  ETATS_BAIL,
  MODES_REGLEMENT,
  TYPES_SEQUENCE_COMPTABLE,
} from '@/store/features/leasing/bail-schemas';
import { createBail, editBail, getBailById, resetBail } from '@/store/features/leasing/bauxSlice';
import { getAllLocataires } from '@/store/features/leasing/locatairesSlice';
import { getRevisionsLoyerHistorique } from '@/store/features/leasing/revisionsLoyerSlice';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { getAllLocaux } from '@/store/features/patrimoine/locauxSlice';
import { useAppSelector } from '@/store/hooks';
import { downloadAttachment, uploadAttachment } from '@/store/services/attachments';
import { addBailPieceJointe, deleteBailPieceJointe, getBailPiecesJointes } from '@/store/services/bailExtras';
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Download,
  FileSignature,
  FileText,
  FolderOpen,
  Info,
  Loader2,
  Paperclip,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  Save,
  ShieldCheck,
  TriangleAlert,
  Trash2,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { z } from 'zod';

const backPath = '/leasing-management/baux';
const ATTACHMENT_FOLDER = 'baux';

// Conteneur d'une section, sur 2 colonnes comme RMANew (DataEntryLocation.aspx).
const Section = ({ icon: Icon, title, children }: { icon: typeof Info; title: string; children: React.ReactNode }) => (
  <div className='border rounded-lg overflow-hidden'>
    <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
      <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
        <Icon className='h-4 w-4' />
      </div>
      <h3 className='text-base font-semibold text-gray-900'>{title}</h3>
    </div>
    <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 items-start [&_input:not([type=checkbox])]:w-full [&_[role=combobox]]:w-full [&_textarea]:w-full'>
      {children}
    </div>
  </div>
);

const Field = ({
  label,
  htmlFor,
  required,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`space-y-2 ${className ?? ''}`}>
    <Label htmlFor={htmlFor} className='text-sm font-medium'>
      {required && <span className='text-red-500'>* </span>}
      {label}
    </Label>
    {children}
    {error && <p className='text-red-600 text-sm'>{error}</p>}
  </div>
);

const emptyForm: BailRequest = {
  numContratLocations: '',
  noBuilding: 0,
  noLocal: 0,
  noLocataire: 0,
  noEncaisseur: null,
  noPeriodicity: null,
  usage: '',
  dateDebut: '',
  dateGestion: '',
  dateFin: '',
  franchise: null,
  loyerNet: null,
  charges: null,
  tva: null,
  taxe: null,
  loyerGarage: null,
  autres: null,
  genererQuittance: false,
  garantie: null,
  caution: null,
  modeReglement: '',
  etat: 'En cours de location',
  notes: '',
  inactif: false,
  typeSequenceComptable: null,
  tauxRevisionLoyer: null,
  duree: null,
  depotGarantie: false,
  cautionFichier: null,
  reference: '',
  dateReglement: '',
  resteCaution: null,
  utiliseeCaution: false,
  observation: '',
  loyersImpayes: null,
  debutImpayes: '',
  finImpayes: '',
  nbMoisImpayes: null,
  arrieresAugmentation: null,
  contentieux: false,
  debutArriere: '',
  finArriere: '',
  fraisJustice: null,
  contratFichier: null,
};

// Clés de la requête : on recopie toutes celles du bail chargé (dates ramenées à AAAA-MM-JJ).
const REQUEST_KEYS = Object.keys(BailRequestSchema.shape);
const buildFormFromItem = (item: Record<string, unknown>, userId: number): BailRequest => {
  const data: Record<string, unknown> = { ...emptyForm };
  for (const key of REQUEST_KEYS) {
    const value = item[key];
    if (value === undefined || value === null) continue;
    data[key] = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) ? value.substring(0, 10) : value;
  }
  data.addUser = (item.addUser as number | null | undefined) ?? undefined;
  data.modUser = userId;
  return data as BailRequest;
};

// RMANew (Validate) : Durée = DateDiff(Month, début, fin).
const dureeMois = (debut?: string | null, fin?: string | null) => {
  if (!debut || !fin) return null;
  const d = new Date(debut);
  const f = new Date(fin);
  if (Number.isNaN(d.getTime()) || Number.isNaN(f.getTime())) return null;
  return (f.getFullYear() - d.getFullYear()) * 12 + f.getMonth() - d.getMonth();
};

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '');
const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type FichierField = 'cautionFichier' | 'contratFichier';

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const readOnly = details ?? false;
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.baux.item);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: locaux } = useAppSelector((state) => state.locaux);
  const { allItems: locataires } = useAppSelector((state) => state.locataires);
  const { allItems: encaisseurs } = useAppSelector((state) => state.cfgEncaisseurs);
  const { allItems: periodicites } = useAppSelector((state) => state.cfgPeriodicites);
  const revisions = useAppSelector((state) => state.revisionsLoyer.historique);

  const preselectedBuilding = Number(searchParams.get('building')) || 0;

  const [formData, setFormData] = useState<BailRequest>({
    ...emptyForm,
    noBuilding: preselectedBuilding,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  // Pièces : dépôt de garantie et contrat de bail (RMANew : LXCaution / LXContrat).
  const [pickedNames, setPickedNames] = useState<Partial<Record<FichierField, string>>>({});
  const [uploadingField, setUploadingField] = useState<FichierField | null>(null);
  const fileInputs = useRef<Partial<Record<FichierField, HTMLInputElement | null>>>({});

  // Pièces jointes libres (RMANew : LXPiecejointe / LXDocumentJoint).
  const [docs, setDocs] = useState<BailPieceJointe[]>([]);
  const [pendingDocs, setPendingDocs] = useState<{ fileName: string; pieceJointe: string; taille: number }[]>([]);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docBusy, setDocBusy] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const docInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 100 }));
    dispatch(getAllLocataires({ pageNumber: 1, pageSize: 100 }));
    dispatch(lookupModules.cfgEncaisseurs.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgPeriodicites.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getBailById(Number(id)));
      getBailPiecesJointes(Number(id)).then(setDocs).catch(() => setDocs([]));
      dispatch(getRevisionsLoyerHistorique({ pageNumber: 1, pageSize: 100, filters: { NoLocation: [Number(id)] } }));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (formData.noBuilding) {
      dispatch(getAllLocaux({ pageNumber: 1, pageSize: 100, filters: { NoBuilding: [formData.noBuilding] } }));
    }
  }, [formData.noBuilding, dispatch]);

  useEffect(() => {
    if (item) setFormData(buildFormFromItem(item as unknown as Record<string, unknown>, userId));
  }, [item, userId]);

  const handleChange = <T extends keyof BailRequest>(field: T, value: BailRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  // Loyer (TC/CC) : même somme que l'API (BailService.ComputeMontant), recalculée à chaque saisie.
  const composantes = [
    formData.loyerNet,
    formData.charges,
    formData.tva,
    formData.taxe,
    formData.loyerGarage,
    formData.autres,
  ];
  // Baux importés : aucune composante, seul le montant total existe -> on l'affiche tel quel.
  const loyerTotal = composantes.every((c) => c == null)
    ? (item?.montant ?? 0)
    : composantes.reduce<number>((s, c) => s + (c ?? 0), 0);
  const duree = dureeMois(formData.dateDebut, formData.dateFin);
  const impayesEncours = (formData.loyersImpayes ?? 0) > 0; // RMANew : coché quand LoyersImpayes > 0

  const handleFile = async (field: FichierField, file: File) => {
    setUploadingField(field);
    try {
      const stored = await uploadAttachment(ATTACHMENT_FOLDER, file);
      handleChange(field, stored);
      setPickedNames((prev) => ({ ...prev, [field]: file.name }));
    } finally {
      setUploadingField(null);
    }
  };

  const addDoc = async () => {
    if (!docFile) return;
    setDocBusy(true);
    setDocError(null);
    try {
      const storedName = await uploadAttachment(ATTACHMENT_FOLDER, docFile);
      const payload = { fileName: docFile.name, pieceJointe: storedName, taille: docFile.size };
      if (item) {
        const created = await addBailPieceJointe(item.numero, { ...payload, addUser: userId });
        setDocs((prev) => [...prev, created]);
      } else {
        // Bail pas encore enregistré : le document est rattaché à la sauvegarde.
        setPendingDocs((prev) => [...prev, payload]);
      }
      setDocFile(null);
    } catch {
      setDocError("Échec de l'envoi du document.");
    } finally {
      setDocBusy(false);
    }
  };

  const removeDoc = async (doc: BailPieceJointe) => {
    if (!item) return;
    try {
      await deleteBailPieceJointe(item.numero, doc.numero);
      setDocs((prev) => prev.filter((d) => d.numero !== doc.numero));
    } catch {
      setDocError('Échec de la suppression du document.');
    }
  };

  const documentRows: { key: string; name: string; stored: string; onDelete: () => void }[] = [
    ...docs.map((d) => ({ key: `d${d.numero}`, name: d.fileName, stored: d.pieceJointe, onDelete: () => removeDoc(d) })),
    ...pendingDocs.map((p, i) => ({
      key: `p${i}`,
      name: p.fileName,
      stored: p.pieceJointe,
      onDelete: () => setPendingDocs((prev) => prev.filter((_, idx) => idx !== i)),
    })),
  ];

  const validate = (data: BailRequest) => {
    try {
      BailRequestSchema.parse(data);
      setErrors({});
      return true;
    } catch (err) {
      const errorMap: { [key: string]: string } = {};
      if (err instanceof z.ZodError) err.errors.forEach((e) => (errorMap[e.path[0] as string] = e.message));
      setErrors(errorMap);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // RMANew (Validate) : la caution saisie (« Montant Caution ») est enregistrée dans Garantie et Caution.
    const data: BailRequest = { ...formData, caution: formData.garantie, duree };
    if (!validate(data)) return;
    if (item) {
      await dispatch(editBail({ id: item.numero, updatedItem: data })).unwrap();
      dispatch(resetBail());
    } else {
      const created = await dispatch(createBail(data)).unwrap();
      await Promise.all(pendingDocs.map((d) => addBailPieceJointe(created.numero, { ...d, addUser: userId })));
    }
    navigate(backPath);
  };

  // ---------- champs génériques ----------
  const text = (field: keyof BailRequest, label: string, opts: { required?: boolean; className?: string } = {}) => (
    <Field label={label} htmlFor={field} required={opts.required} error={errors[field]} className={opts.className}>
      <Input
        id={field}
        value={(formData[field] as string | null | undefined) ?? ''}
        onChange={(e) => handleChange(field, e.target.value as never)}
        disabled={readOnly}
      />
    </Field>
  );
  const num = (field: keyof BailRequest, label: string, step = '0.01') => (
    <Field label={label} htmlFor={field} error={errors[field]}>
      <Input
        id={field}
        type='number'
        step={step}
        value={(formData[field] as number | null | undefined) ?? ''}
        onChange={(e) => handleChange(field, numOrNull(e.target.value) as never)}
        disabled={readOnly}
      />
    </Field>
  );
  const date = (field: keyof BailRequest, label: string, required?: boolean) => (
    <Field label={label} htmlFor={field} required={required} error={errors[field]}>
      <Input
        id={field}
        type='date'
        value={(formData[field] as string | null | undefined) ?? ''}
        onChange={(e) => handleChange(field, e.target.value as never)}
        disabled={readOnly}
        className={errors[field] ? 'border-red-300' : ''}
      />
    </Field>
  );
  const readonlyInput = (label: string, value: string) => (
    <Field label={label}>
      <Input value={value} readOnly disabled className='bg-gray-50' />
    </Field>
  );
  const check = (field: keyof BailRequest, label: string) => (
    <label className='flex items-center gap-2 text-sm whitespace-nowrap'>
      <Checkbox
        checked={Boolean(formData[field])}
        onCheckedChange={(c) => handleChange(field, (c === true) as never)}
        disabled={readOnly}
      />
      {label}
    </label>
  );
  const fichier = (field: FichierField, label: string) => (
    <div className='flex items-center gap-1 flex-1 min-w-0'>
      <Input
        id={field}
        readOnly
        value={pickedNames[field] ?? (formData[field] ? label : '')}
        className='flex-1 min-w-0 bg-gray-50'
      />
      {formData[field] && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 shrink-0'
          title='Télécharger'
          onClick={() => downloadAttachment(ATTACHMENT_FOLDER, formData[field]!, pickedNames[field])}
        >
          <Download className='h-4 w-4' />
        </Button>
      )}
      {!readOnly && (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-8 px-2 shrink-0 text-blue-600 hover:text-sky-700 dark:text-sky-400 hover:bg-sky-500/10'
          disabled={uploadingField === field}
          onClick={() => fileInputs.current[field]?.click()}
        >
          {uploadingField === field ? (
            <Loader2 className='h-4 w-4 mr-1 animate-spin' />
          ) : (
            <FolderOpen className='h-4 w-4 mr-1' />
          )}
          Parcourir
        </Button>
      )}
      <input
        ref={(el) => {
          fileInputs.current[field] = el;
        }}
        type='file'
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) handleFile(field, file);
        }}
      />
    </div>
  );

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>
          <Title title={item ? `Bail — ${item.nomLocataire ?? ''}` : 'Ajouter un bail'} />
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <div className='contents'>
          {/* ===================== Identification ===================== */}
          <Section icon={FileSignature} title='Identification'>
            {text('numContratLocations', 'N° Contrats')}

            <Field label='Actif' htmlFor='noBuilding' required error={errors.noBuilding}>
              <Select
                value={formData.noBuilding ? formData.noBuilding.toString() : ''}
                onValueChange={(value) => {
                  handleChange('noBuilding', Number(value));
                  handleChange('noLocal', 0);
                }}
                disabled={readOnly}
              >
                <SelectTrigger id='noBuilding' className={errors.noBuilding ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez un actif...' />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => (
                    <SelectItem key={b.numero} value={b.numero.toString()}>
                      {b.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label='Locataire' htmlFor='noLocataire' required error={errors.noLocataire}>
              <div className='flex items-center gap-2'>
              <div className='flex-1 min-w-0'>
              <Select
                value={formData.noLocataire ? formData.noLocataire.toString() : ''}
                onValueChange={(value) => handleChange('noLocataire', Number(value))}
                disabled={readOnly}
              >
                <SelectTrigger id='noLocataire' className={errors.noLocataire ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {locataires.map((l) => (
                    <SelectItem key={l.numero} value={l.numero.toString()}>
                      {l.nomAffiche}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
              {!readOnly && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-9 w-9 shrink-0 text-blue-600'
                  title='Ajouter un locataire'
                  onClick={() => navigate('/leasing-management/locataires/ajouter')}
                >
                  <UserPlus className='h-4 w-4' />
                </Button>
              )}
              </div>
            </Field>

            <Field label='Local' htmlFor='noLocal' required error={errors.noLocal}>
              <Select
                value={formData.noLocal ? formData.noLocal.toString() : ''}
                onValueChange={(value) => handleChange('noLocal', Number(value))}
                disabled={readOnly || !formData.noBuilding}
              >
                <SelectTrigger id='noLocal' className={errors.noLocal ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Choisir un local' />
                </SelectTrigger>
                <SelectContent>
                  {locaux.map((l) => (
                    <SelectItem key={l.numero} value={l.numero.toString()}>
                      {l.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label='Encaisseur' htmlFor='noEncaisseur'>
              <Select
                value={formData.noEncaisseur?.toString() || '0'}
                onValueChange={(value) => handleChange('noEncaisseur', value === '0' ? null : Number(value))}
                disabled={readOnly}
              >
                <SelectTrigger id='noEncaisseur'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucun</SelectItem>
                  {encaisseurs.map((e) => (
                    <SelectItem key={e.numero} value={e.numero.toString()}>
                      {e.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {text('usage', 'Usage')}

            <Field label='Périodicité de Facturation' htmlFor='noPeriodicity'>
              <Select
                value={formData.noPeriodicity?.toString() || '0'}
                onValueChange={(value) => handleChange('noPeriodicity', value === '0' ? null : Number(value))}
                disabled={readOnly}
              >
                <SelectTrigger id='noPeriodicity'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucune</SelectItem>
                  {periodicites.map((p) => (
                    <SelectItem key={p.numero} value={p.numero.toString()}>
                      {p.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label='Type séquence comptable' htmlFor='typeSequenceComptable'>
              <Select
                value={formData.typeSequenceComptable ?? ''}
                onValueChange={(value) => handleChange('typeSequenceComptable', value)}
                disabled={readOnly}
              >
                <SelectTrigger id='typeSequenceComptable'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_SEQUENCE_COMPTABLE.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label='Désignation' htmlFor='notes' className='col-span-full'>
              <Textarea
                id='notes'
                rows={3}
                value={formData.notes ?? ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={readOnly}
              />
            </Field>
          </Section>

          {/* ===================== Date ===================== */}
          <Section icon={CalendarDays} title='Date'>
            {date('dateDebut', 'Début de bail', true)}
            {date('dateGestion', 'Date de gestion')}
            {date('dateFin', 'Date de fin')}
            {readonlyInput('Durée (mois)', duree != null ? String(duree) : '')}
            {num('franchise', 'Franchises (mois)', '1')}
            {readonlyInput('Date Dernier révision loyer', fmtDate(item?.dateDerniereRevision))}
            {readonlyInput('Date Prochaine Revision', fmtDate(item?.dateProchaineRevision))}
            {num('tauxRevisionLoyer', 'Taux de Révision')}
          </Section>

          {/* ===================== Loyer ===================== */}
          <Section icon={Banknote} title='Loyer ( TVA=20% Taxe=10,5% )'>
            {num('loyerNet', 'Loyer de base')}
            {num('charges', 'Charges locatives')}
            {num('tva', 'TVA')}
            {num('taxe', 'Taxe')}
            {num('autres', 'Autres')}
            {num('loyerGarage', 'Loyer du garage')}
            <Field label='Loyer (TC/CC)' className='sm:col-span-2'>
              <div className='flex items-center gap-3'>
                <Input value={fmtMontant(loyerTotal)} readOnly disabled className='flex-1 min-w-0 bg-gray-50' />
                {/* RMANew : bouton « Recalculer » ; ici le total se recalcule déjà à chaque saisie. */}
                <RefreshCw className='h-4 w-4 shrink-0 text-muted-foreground' aria-label='Recalculé automatiquement' />
                {check('genererQuittance', 'Générer quittance')}
              </div>
            </Field>
          </Section>

          {/* ===================== Garantie ===================== */}
          <Section icon={ShieldCheck} title='Garantie'>
            {num('garantie', 'Montant Caution')}
            <Field label='Dépot de garantie' className='sm:col-span-2'>
              <div className='flex items-center gap-3'>
                {fichier('cautionFichier', 'Dépôt de garantie')}
                {check('depotGarantie', 'Dépot de garantie accepté')}
              </div>
            </Field>
            {item && formData.cautionFichier && (
              <Field label='Reçu dépôt garanti'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => downloadAttachment(ATTACHMENT_FOLDER, formData.cautionFichier!, pickedNames.cautionFichier)}
                >
                  <Download className='h-4 w-4 mr-1' />
                  Télécharger
                </Button>
              </Field>
            )}
            {text('reference', 'Référence')}
            {date('dateReglement', 'Date de règlement')}
            <Field label='Mode de règlement' htmlFor='modeReglement'>
              <Select
                value={formData.modeReglement ?? ''}
                onValueChange={(value) => handleChange('modeReglement', value)}
                disabled={readOnly}
              >
                <SelectTrigger id='modeReglement'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {MODES_REGLEMENT.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label='Caution restant' htmlFor='resteCaution' className='sm:col-span-2'>
              <div className='flex items-center gap-3'>
                <Input
                  id='resteCaution'
                  type='number'
                  step='0.01'
                  value={formData.resteCaution ?? ''}
                  onChange={(e) => handleChange('resteCaution', numOrNull(e.target.value))}
                  disabled={readOnly}
                  className='flex-1 min-w-0'
                />
                {check('utiliseeCaution', 'Utilisée la caution')}
              </div>
            </Field>
            <Field label='Observations' htmlFor='observation' className='col-span-full'>
              <Textarea
                id='observation'
                rows={4}
                value={formData.observation ?? ''}
                onChange={(e) => handleChange('observation', e.target.value)}
                disabled={readOnly}
              />
            </Field>
          </Section>

          </div>
          <div className='contents'>
          {/* ===================== Etat des Loyers ===================== */}
          <Section icon={TriangleAlert} title='Etat des Loyers'>
            {num('loyersImpayes', 'Impayés')}
            {date('debutImpayes', 'Début Impayés')}
            {date('finImpayes', 'Fin Impayés')}
            {num('nbMoisImpayes', 'Nb périodes Impayés', '1')}
            {num('arrieresAugmentation', "Arriérés d'augmentation")}
            {date('debutArriere', 'Début Arriérés')}
            {date('finArriere', 'Fin Arriérés')}
            {num('fraisJustice', 'Frais de justice')}
            <div className='lg:pt-1'>{check('contentieux', 'Contentieux')}</div>
          </Section>

          {/* ===================== Etat des Avoirs ===================== */}
          <Section icon={ReceiptText} title='Etat des Avoirs'>
            {readonlyInput('Montant Avoirs', item ? fmtMontant(item.montantAvoirs ?? 0) : '')}
          </Section>

          {/* ===================== Contrat de Bail ===================== */}
          <Section icon={FileText} title='Contrat de Bail'>
            <Field label='Joindre le Contrat' className='sm:col-span-2'>{fichier('contratFichier', 'Contrat de bail')}</Field>
            <Field label='Etat' htmlFor='etat' className='sm:col-span-2'>
              <div className='flex items-center gap-3'>
                <div className='flex-1 min-w-0'>
                  <Select value={formData.etat} onValueChange={(value) => handleChange('etat', value)} disabled={readOnly}>
                    <SelectTrigger id='etat'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ETATS_BAIL.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <label className='flex items-center gap-2 text-sm whitespace-nowrap'>
                  <Checkbox checked={impayesEncours} disabled />
                  Impayés encours
                </label>
              </div>
            </Field>
          </Section>

          {/* ===================== Pièces jointes ===================== */}
          <Section icon={Paperclip} title='Pièces jointes'>
            {!readOnly && (
              <Field label='Fichier' htmlFor='docFichier' className='col-span-full'>
                <div className='flex items-center gap-2'>
                  <Input id='docFichier' readOnly value={docFile?.name ?? ''} className='flex-1 min-w-0 bg-gray-50' />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='h-8 px-2 shrink-0 text-blue-600 hover:text-sky-700 dark:text-sky-400 hover:bg-sky-500/10'
                    onClick={() => docInput.current?.click()}
                  >
                    <FolderOpen className='h-4 w-4 mr-1' />
                    Parcourir
                  </Button>
                  <Button
                    type='button'
                    size='icon'
                    className='h-9 w-9 shrink-0 rounded-lg bg-[#1c4d8c] hover:bg-[#163e72] text-white'
                    title='Ajouter'
                    disabled={!docFile || docBusy}
                    onClick={addDoc}
                  >
                    {docBusy ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}
                  </Button>
                  <input
                    ref={docInput}
                    type='file'
                    className='hidden'
                    onChange={(e) => {
                      setDocFile(e.target.files?.[0] ?? null);
                      e.target.value = '';
                    }}
                  />
                </div>
                {docError && <p className='text-red-600 text-sm'>{docError}</p>}
              </Field>
            )}
            <div className='col-span-full'>
              <h4 className='text-sm font-semibold mb-2'>Document joint</h4>
              {documentRows.length === 0 ? (
                <p className='text-sm text-gray-500'>Aucun document joint.</p>
              ) : (
                <ul className='border rounded-lg divide-y'>
                  {documentRows.map((row) => (
                    <li key={row.key} className='flex items-center justify-between px-3 py-2 text-sm'>
                      <span className='font-medium truncate pr-3' title={row.name}>
                        {row.name}
                      </span>
                      <span className='flex items-center gap-1 shrink-0'>
                        {!readOnly && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                            title='Supprimer'
                            onClick={row.onDelete}
                          >
                            <Trash2 className='h-4 w-4 text-red-600' />
                          </Button>
                        )}
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          title='Télécharger'
                          onClick={() => downloadAttachment(ATTACHMENT_FOLDER, row.stored, row.name)}
                        >
                          <Download className='h-4 w-4' />
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Section>

          {/* ===================== Révision Loyer ===================== */}
          {item && (
            <div className='border rounded-lg overflow-hidden'>
              <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
                <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
                  <TrendingUp className='h-4 w-4' />
                </div>
                <h3 className='text-base font-semibold text-gray-900'>Révision Loyer</h3>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-50 text-left'>
                    <tr>
                      {['Anc. Loyer', 'Nouv. Loyer', 'Date Dernier Révision', 'Date Prochaine Révision', 'Ecart', 'Date saisie', ''].map((h) => (
                        <th key={h} className='px-3 py-2 font-medium whitespace-nowrap'>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {revisions.length === 0 && (
                      <tr>
                        <td colSpan={7} className='px-3 py-4 text-center text-muted-foreground'>
                          Aucune révision de loyer.
                        </td>
                      </tr>
                    )}
                    {revisions.map((r) => (
                      <tr key={r.numero} className='border-t hover:bg-gray-50'>
                        <td className='px-3 py-2'>{fmtMontant(r.ancienLoyer ?? 0)}</td>
                        <td className='px-3 py-2'>{fmtMontant(r.nouveauLoyer ?? 0)}</td>
                        <td className='px-3 py-2'>{fmtDate(r.dateRevision)}</td>
                        <td className='px-3 py-2'>{fmtDate(r.dateProchaineRevision)}</td>
                        <td className='px-3 py-2'>{fmtMontant((r.nouveauLoyer ?? 0) - (r.ancienLoyer ?? 0))}</td>
                        <td className='px-3 py-2'>{fmtDate(r.addDate)}</td>
                        <td className='px-3 py-2'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                            title='Détails'
                            onClick={() => navigate(`/leasing-management/revisions-loyers/modifier/${r.numero}`)}
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </form>
      </CardContent>
      <Separator />
      {/* RMANew : « Retour » puis « Sauvegarder ». */}
      <CardFooter className='flex justify-end gap-2 mt-6'>
        <Button variant='outline'
          className='border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary' onClick={() => navigate(backPath)}>
          <ArrowLeft />
          Retour
        </Button>
        {!readOnly && (
          <Button onClick={handleSubmit}>
            <Save />
            Sauvegarder
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Form;
