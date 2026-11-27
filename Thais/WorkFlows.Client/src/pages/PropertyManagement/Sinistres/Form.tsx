import { GridSection as Section, FormGroupTitle } from '@/components/form/form-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/title';
import { AppDispatch, RootState } from '@/store';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { getAllLocaux } from '@/store/features/patrimoine/locauxSlice';
import { getAllAssurances } from '@/store/features/property-management/assurancesSlice';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import {
  ETAPES_SUIVI_SINISTRE,
  SinistreRequest,
  SinistreRequestSchema,
} from '@/store/features/property-management/sinistre-schemas';
import {
  createSinistre,
  downloadSinistreAttachment,
  editSinistre,
  getSinistreById,
  resetSinistre,
  SinistreAttachmentKind,
  uploadSinistreAttachment,
} from '@/store/features/property-management/sinistresSlice';
import { useAppSelector } from '@/store/hooks';
import { AlertTriangle, Download, Paperclip, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/property-management/sinistres';

const emptyForm: SinistreRequest = {
  noBuilding: 0,
  noLocal: null,
  noAssurance: null,
  noTypeSinistre: 0,
  etapeSuivi: 'Déclaré',
  dateDeclaration: '',
  dateExpertise: '',
  dateReclamation: '',
  dateRemboursement: '',
  estimationDegatBailleur: null,
  estimationDegatLocataire: null,
  montantFacture: null,
  montantRemuneration: null,
  cumul: null,
  nomExpert: '',
  refDossierAssurance: '',
  notes: '',
  noSinistre: '',
  agentAyantReclame: '',
  compteurFicheIntervention: '',
  referenceDossierDAG: '',
  montantExpert: null,
  referenceFacture: '',
  objetReclamation: '',
  site: '',
};

const ATTACHMENT_FIELDS: { kind: SinistreAttachmentKind; label: string; responseField: 'cheminExpertiseLocataire' | 'cheminExpertiseBailleur' | 'cheminPVExpertise' }[] = [
  { kind: 'expertise-locataire', label: 'CR Expert Locataire', responseField: 'cheminExpertiseLocataire' },
  { kind: 'expertise-bailleur', label: 'CR Expert Bailleur', responseField: 'cheminExpertiseBailleur' },
  { kind: 'pv-expertise', label: "PV d'expertise", responseField: 'cheminPVExpertise' },
];

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [pendingFiles, setPendingFiles] = useState<Partial<Record<SinistreAttachmentKind, File>>>({});
  const [uploadingAttachment, setUploadingAttachment] = useState<SinistreAttachmentKind | null>(null);
  const fileInputRefs = useRef<Partial<Record<SinistreAttachmentKind, HTMLInputElement | null>>>({});

  const item = useAppSelector((state: RootState) => state.sinistresPm.item);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: locaux } = useAppSelector((state) => state.locaux);
  const { allItems: assurances } = useAppSelector((state) => state.assurancesPm);
  const { allItems: typesSinistre } = useAppSelector((state) => state.cfgTypologiesSinistre);

  const [formData, setFormData] = useState<SinistreRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 1000 }));
    dispatch(getAllLocaux({ pageNumber: 1, pageSize: 1000 }));
    dispatch(getAllAssurances({ pageNumber: 1, pageSize: 1000 }));
    dispatch(lookupModules.cfgTypologiesSinistre.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getSinistreById(Number(id)));
    }
  }, [id, dispatch]);

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noBuilding: item.noBuilding,
        noLocal: item.noLocal ?? null,
        noAssurance: item.noAssurance ?? null,
        noTypeSinistre: item.noTypeSinistre,
        etapeSuivi: item.etapeSuivi,
        dateDeclaration: item.dateDeclaration ? item.dateDeclaration.substring(0, 10) : '',
        dateExpertise: item.dateExpertise ? item.dateExpertise.substring(0, 10) : '',
        dateReclamation: item.dateReclamation ? item.dateReclamation.substring(0, 10) : '',
        dateRemboursement: item.dateRemboursement ? item.dateRemboursement.substring(0, 10) : '',
        estimationDegatBailleur: item.estimationDegatBailleur ?? null,
        estimationDegatLocataire: item.estimationDegatLocataire ?? null,
        montantFacture: item.montantFacture ?? null,
        montantRemuneration: item.montantRemuneration ?? null,
        cumul: item.cumul ?? null,
        nomExpert: item.nomExpert ?? '',
        refDossierAssurance: item.refDossierAssurance ?? '',
        notes: item.notes ?? '',
        noSinistre: item.noSinistre ?? '',
        agentAyantReclame: item.agentAyantReclame ?? '',
        compteurFicheIntervention: item.compteurFicheIntervention ?? '',
        referenceDossierDAG: item.referenceDossierDAG ?? '',
        montantExpert: item.montantExpert ?? null,
        referenceFacture: item.referenceFacture ?? '',
        objetReclamation: item.objetReclamation ?? '',
        site: item.site ?? '',
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof SinistreRequest>(field: T, value: SinistreRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const localsForBuilding = locaux.filter((l) => l.noBuilding === formData.noBuilding);

  const validate = (data: SinistreRequest) => {
    try {
      SinistreRequestSchema.parse(data);
      setErrors({});
      return true;
    } catch (err) {
      const errorMap: { [key: string]: string } = {};
      if (err instanceof z.ZodError) {
        err.errors.forEach((e) => {
          errorMap[e.path[0] as string] = e.message;
        });
      }
      setErrors(errorMap);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(formData)) return;

    let sinistreId: number;
    if (item) {
      const updated = await dispatch(editSinistre({ id: item.numero, updatedItem: formData })).unwrap();
      sinistreId = updated.numero;
    } else {
      const created = await dispatch(createSinistre(formData)).unwrap();
      sinistreId = created.numero;
    }

    for (const [kind, file] of Object.entries(pendingFiles) as [SinistreAttachmentKind, File][]) {
      if (file) {
        await dispatch(uploadSinistreAttachment({ id: sinistreId, kind, file })).unwrap();
      }
    }

    dispatch(resetSinistre());
    navigate(backPath);
  };

  const handleFileSelect = (kind: SinistreAttachmentKind, file: File | null) => {
    setPendingFiles((prev) => ({ ...prev, [kind]: file ?? undefined }));
  };

  const handleDownload = async (kind: SinistreAttachmentKind, fileName: string) => {
    if (!item) return;
    setUploadingAttachment(kind);
    try {
      await downloadSinistreAttachment(item.numero, kind, fileName);
    } finally {
      setUploadingAttachment(null);
    }
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle className='flex justify-between'>
          <Title
            title={
              changeToDetails
                ? `Détails sinistre — ${item?.idSinistre ?? ''}`
                : item
                ? `Modifier sinistre — ${item.idSinistre ?? ''}`
                : 'Ajouter un sinistre'
            }
          />
          {item && (
            <Button onClick={() => setChangeToDetails(!changeToDetails)}>
              {changeToDetails ? 'Modifier' : 'Détails'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <Section icon={AlertTriangle} title='Informations'>
            <FormGroupTitle>Identification du sinistre</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='noSinistre' className='text-sm font-medium'>
                N°Sinistre
              </Label>
              <Input
                id='noSinistre'
                value={formData.noSinistre ?? ''}
                onChange={(e) => handleChange('noSinistre', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='noBuilding' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Actif
              </Label>
              <Select
                value={formData.noBuilding ? formData.noBuilding.toString() : ''}
                onValueChange={(value) => handleChange('noBuilding', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noBuilding' className={errors.noBuilding ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => (
                    <SelectItem key={b.numero} value={b.numero.toString()}>
                      {b.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.noBuilding && <p className='text-red-600 text-sm'>{errors.noBuilding}</p>}
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='noLocal' className='text-sm font-medium'>
                Local
              </Label>
              <Select
                value={formData.noLocal?.toString() || '0'}
                onValueChange={(value) => handleChange('noLocal', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noLocal'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucun</SelectItem>
                  {localsForBuilding.map((l) => (
                    <SelectItem key={l.numero} value={l.numero.toString()}>
                      {l.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='noTypeSinistre' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Type de sinistre
              </Label>
              <Select
                value={formData.noTypeSinistre ? formData.noTypeSinistre.toString() : ''}
                onValueChange={(value) => handleChange('noTypeSinistre', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noTypeSinistre' className={errors.noTypeSinistre ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {typesSinistre.map((t) => (
                    <SelectItem key={t.numero} value={t.numero.toString()}>
                      {t.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.noTypeSinistre && <p className='text-red-600 text-sm'>{errors.noTypeSinistre}</p>}
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='noAssurance' className='text-sm font-medium'>
                Police d'assurance
              </Label>
              <Select
                value={formData.noAssurance?.toString() || '0'}
                onValueChange={(value) => handleChange('noAssurance', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noAssurance'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucune</SelectItem>
                  {assurances.map((a) => (
                    <SelectItem key={a.numero} value={a.numero.toString()}>
                      {a.numPolice || `Police #${a.numero}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='etapeSuivi' className='text-sm font-medium'>
                Étape de suivi
              </Label>
              <Select
                value={formData.etapeSuivi ?? 'Déclaré'}
                onValueChange={(value) => handleChange('etapeSuivi', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='etapeSuivi'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ETAPES_SUIVI_SINISTRE.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='cumul' className='text-sm font-medium'>
                Cumul en nombre des dossiers remis
              </Label>
              <Input
                id='cumul'
                type='number'
                value={formData.cumul ?? ''}
                onChange={(e) => handleChange('cumul', e.target.value === '' ? null : Number(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='agentAyantReclame' className='text-sm font-medium'>
                Agent ayant réclamé
              </Label>
              <Input
                id='agentAyantReclame'
                value={formData.agentAyantReclame ?? ''}
                onChange={(e) => handleChange('agentAyantReclame', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <FormGroupTitle>Dossier</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='referenceDossierDAG' className='text-sm font-medium'>
                Reference Dossier DAG
              </Label>
              <Input
                id='referenceDossierDAG'
                value={formData.referenceDossierDAG ?? ''}
                onChange={(e) => handleChange('referenceDossierDAG', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='refDossierAssurance' className='text-sm font-medium'>
                Réf. dossier assurance
              </Label>
              <Input
                id='refDossierAssurance'
                value={formData.refDossierAssurance ?? ''}
                onChange={(e) => handleChange('refDossierAssurance', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='referenceFacture' className='text-sm font-medium'>
                Référence de facture
              </Label>
              <Input
                id='referenceFacture'
                value={formData.referenceFacture ?? ''}
                onChange={(e) => handleChange('referenceFacture', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='compteurFicheIntervention' className='text-sm font-medium'>
                Compteur fiche d'intervention
              </Label>
              <Input
                id='compteurFicheIntervention'
                value={formData.compteurFicheIntervention ?? ''}
                onChange={(e) => handleChange('compteurFicheIntervention', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <FormGroupTitle>Dates</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateReclamation' className='text-sm font-medium'>
                Date réclamation
              </Label>
              <Input
                id='dateReclamation'
                type='date'
                value={formData.dateReclamation ?? ''}
                onChange={(e) => handleChange('dateReclamation', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateDeclaration' className='text-sm font-medium'>
                Date déclaration
              </Label>
              <Input
                id='dateDeclaration'
                type='date'
                value={formData.dateDeclaration ?? ''}
                onChange={(e) => handleChange('dateDeclaration', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateExpertise' className='text-sm font-medium'>
                Date expertise
              </Label>
              <Input
                id='dateExpertise'
                type='date'
                value={formData.dateExpertise ?? ''}
                onChange={(e) => handleChange('dateExpertise', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateRemboursement' className='text-sm font-medium'>
                Date remboursement
              </Label>
              <Input
                id='dateRemboursement'
                type='date'
                value={formData.dateRemboursement ?? ''}
                onChange={(e) => handleChange('dateRemboursement', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <FormGroupTitle>Expertise</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='nomExpert' className='text-sm font-medium'>
                Nom de l'expert
              </Label>
              <Input
                id='nomExpert'
                value={formData.nomExpert ?? ''}
                onChange={(e) => handleChange('nomExpert', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='montantExpert' className='text-sm font-medium'>
                Montant de l'Expert
              </Label>
              <Input
                id='montantExpert'
                type='number'
                step='0.01'
                value={formData.montantExpert ?? ''}
                onChange={(e) => handleChange('montantExpert', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <FormGroupTitle>Montants</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='estimationDegatBailleur' className='text-sm font-medium'>
                Estimation dégât bailleur
              </Label>
              <Input
                id='estimationDegatBailleur'
                type='number'
                step='0.01'
                value={formData.estimationDegatBailleur ?? ''}
                onChange={(e) => handleChange('estimationDegatBailleur', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='estimationDegatLocataire' className='text-sm font-medium'>
                Estimation dégât locataire
              </Label>
              <Input
                id='estimationDegatLocataire'
                type='number'
                step='0.01'
                value={formData.estimationDegatLocataire ?? ''}
                onChange={(e) => handleChange('estimationDegatLocataire', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='montantFacture' className='text-sm font-medium'>
                Montant facturé
              </Label>
              <Input
                id='montantFacture'
                type='number'
                step='0.01'
                value={formData.montantFacture ?? ''}
                onChange={(e) => handleChange('montantFacture', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='montantRemuneration' className='text-sm font-medium'>
                Montant remboursé
              </Label>
              <Input
                id='montantRemuneration'
                type='number'
                step='0.01'
                value={formData.montantRemuneration ?? ''}
                onChange={(e) => handleChange('montantRemuneration', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <FormGroupTitle>Description</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 md:col-span-6'>
              <Label htmlFor='objetReclamation' className='text-sm font-medium'>
                Objet de réclamation
              </Label>
              <Input
                id='objetReclamation'
                value={formData.objetReclamation ?? ''}
                onChange={(e) => handleChange('objetReclamation', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 md:col-span-6'>
              <Label htmlFor='site' className='text-sm font-medium'>
                Site
              </Label>
              <Input
                id='site'
                value={formData.site ?? ''}
                onChange={(e) => handleChange('site', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12'>
              <Label htmlFor='notes' className='text-sm font-medium'>
                Notes
              </Label>
              <Textarea
                id='notes'
                rows={3}
                value={formData.notes ?? ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <FormGroupTitle>Pièces jointes</FormGroupTitle>

            {ATTACHMENT_FIELDS.map(({ kind, label, responseField }) => {
              const existingFileName = item?.[responseField];
              const selectedFile = pendingFiles[kind];
              return (
                <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4' key={kind}>
                  <Label htmlFor={`file-${kind}`} className='text-sm font-medium'>
                    {label}
                  </Label>
                  <div className='flex items-center gap-2'>
                    <div className='flex-1 flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm text-gray-600 truncate'>
                      <Paperclip className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
                      <span className='truncate'>
                        {selectedFile?.name ?? existingFileName ?? 'Aucun fichier'}
                      </span>
                    </div>
                    {!changeToDetails && (
                      <>
                        <input
                          ref={(el) => {
                            fileInputRefs.current[kind] = el;
                          }}
                          id={`file-${kind}`}
                          type='file'
                          accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                          className='hidden'
                          onChange={(e) => handleFileSelect(kind, e.target.files?.[0] ?? null)}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => fileInputRefs.current[kind]?.click()}
                        >
                          Parcourir
                        </Button>
                      </>
                    )}
                    {existingFileName && !selectedFile && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        disabled={uploadingAttachment === kind}
                        onClick={() => handleDownload(kind, existingFileName)}
                      >
                        <Download className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </Section>
        </form>
      </CardContent>
      <Separator />
      <CardFooter className='flex justify-end gap-2 mt-6'>
        <Button variant='outline'
          className='border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary' onClick={() => navigate(backPath)}>
          <ArrowLeft />
          Retour
        </Button>
        {!changeToDetails && (
          <Button onClick={handleSubmit}><Save />{item ? 'Mettre à jour' : 'Sauvegarder'}</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Form;
