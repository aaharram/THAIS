import { BaseDialog } from '@/components/dialog/dialog';
import {
  Field,
  FormErrorBanner,
  FormGrid,
  FormGroupTitle,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/form/form-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Title } from '@/components/ui/title';
import { AppDispatch, RootState } from '@/store';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import {
  ETATS_DOCUMENT,
  LocataireRequest,
  LocataireRequestSchema,
  TYPES_LOCATAIRE,
} from '@/store/features/leasing/locataire-schemas';
import {
  createLocataire,
  deleteLocataire,
  editLocataire,
  getLocataireById,
  resetLocataire,
} from '@/store/features/leasing/locatairesSlice';
import { useAppSelector } from '@/store/hooks';
import { ArrowLeft, FileText, MapPin, Paperclip, Plus, Save, StickyNote, User, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/leasing-management/locataires';

const emptyForm: LocataireRequest = {
  codeLocataire: '',
  typeLocataire: 0,
  designationEntreprise: '',
  rc: '',
  idF: '',
  noCIN: '',
  ice: '',
  prenom: '',
  nom: '',
  telephone: '',
  email: '',
  adresse: '',
  postalCode: '',
  noCity: null,
  noCountry: null,
  notes: '',
  noBuilding: null,
  noLocal: null,
  statutsDispo: false,
  rcDispo: false,
  pieceIdentiteDispo: false,
  autresDispo: false,
  autreContactNom: '',
  autreContactPrenom: '',
  autreContactTelephone: '',
  autreContactPoste: '',
  autreContactEmail: '',
  inactif: false,
};

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // Sélection de fichier locale uniquement (pas d'infra de stockage côté serveur) : le
  // fichier n'est jamais envoyé au backend, ce champ ne fait que refléter le "Parcourir".
  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [autreDocumentFichier, setAutreDocumentFichier] = useState<File | null>(null);
  const [autresDocuments, setAutresDocuments] = useState<string[]>([]);
  const autreDocumentInputRef = useRef<HTMLInputElement | null>(null);

  const item = useAppSelector((state: RootState) => state.locataires.item);
  const { allItems: villes } = useAppSelector((state) => state.cfgVilles);
  const { allItems: paysList } = useAppSelector((state) => state.cfgPays);

  const [formData, setFormData] = useState<LocataireRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(lookupModules.cfgVilles.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgPays.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getLocataireById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        codeLocataire: item.codeLocataire ?? '',
        typeLocataire: item.typeLocataire,
        designationEntreprise: item.designationEntreprise ?? '',
        rc: item.rc ?? '',
        idF: item.idF ?? '',
        noCIN: item.noCIN ?? '',
        ice: item.ice ?? '',
        prenom: item.prenom ?? '',
        nom: item.nom ?? '',
        telephone: item.telephone ?? '',
        email: item.email ?? '',
        adresse: item.adresse ?? '',
        postalCode: item.postalCode ?? '',
        noCity: item.noCity ?? null,
        noCountry: item.noCountry ?? null,
        notes: item.notes ?? '',
        noBuilding: item.noBuilding ?? null,
        noLocal: item.noLocal ?? null,
        statutsDispo: item.statutsDispo,
        rcDispo: item.rcDispo,
        pieceIdentiteDispo: item.pieceIdentiteDispo,
        autresDispo: item.autresDispo,
        autreContactNom: item.autreContactNom ?? '',
        autreContactPrenom: item.autreContactPrenom ?? '',
        autreContactTelephone: item.autreContactTelephone ?? '',
        autreContactPoste: item.autreContactPoste ?? '',
        autreContactEmail: item.autreContactEmail ?? '',
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof LocataireRequest>(field: T, value: LocataireRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: LocataireRequest) => {
    try {
      LocataireRequestSchema.parse(data);
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

    if (item) {
      await dispatch(editLocataire({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetLocataire());
    } else {
      await dispatch(createLocataire(formData)).unwrap();
    }

    navigate(backPath);
  };

  const confirmDelete = () => {
    if (item) {
      dispatch(deleteLocataire(item.numero));
      dispatch(resetLocataire());
      navigate(backPath);
      setDeleteDialogOpen(false);
    }
  };

  const tauxAvancement = Math.round(
    ([formData.statutsDispo, formData.rcDispo, formData.pieceIdentiteDispo, formData.autresDispo].filter(Boolean)
      .length *
      100) /
      4,
  );

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle className='flex justify-between'>
          <Title
            title={
              changeToDetails
                ? `Détails "${item?.nomAffiche ?? ''}"`
                : item
                ? `Modifier "${item.nomAffiche}"`
                : 'Ajouter un locataire'
            }
          />
          {item && (
            <div className='flex justify-end gap-2'>
              <Button onClick={() => setChangeToDetails(!changeToDetails)}>
                {changeToDetails ? 'Modifier' : 'Détails'}
              </Button>
              <Button variant='destructive' onClick={() => setDeleteDialogOpen(true)}>
                Supprimer
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        <FormErrorBanner errors={errors} />
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* ------------------------------------------------ 1. qui est le locataire */}
          <FormSection icon={Users} title='Identité' description='Type, nom et identification légale du locataire'>
            <FormGrid>
              <FormGroupTitle>Locataire</FormGroupTitle>
              <SelectField
                id='typeLocataire'
                label='Type'
                required
                span={4}
                value={formData.typeLocataire.toString()}
                onChange={(value) => handleChange('typeLocataire', Number(value))}
                options={TYPES_LOCATAIRE.map((t) => ({ value: t.value.toString(), label: t.label }))}
                disabled={changeToDetails}
                error={errors.typeLocataire}
              />
                  <TextField
                    id='codeLocataire'
                    label='Code locataire'
                    span={4}
                    value={formData.codeLocataire}
                    onChange={(v) => handleChange('codeLocataire', v)}
                    disabled={changeToDetails}
                    error={errors.codeLocataire}
                  />
                  <TextField
                    id='designationEntreprise'
                    label='Raison sociale'
                    span={4}
                    value={formData.designationEntreprise}
                    onChange={(v) => handleChange('designationEntreprise', v)}
                    disabled={changeToDetails}
                    error={errors.designationEntreprise}
                  />
                  <TextField
                    id='prenom'
                    label='Prénom'
                    span={4}
                    value={formData.prenom}
                    onChange={(v) => handleChange('prenom', v)}
                    disabled={changeToDetails}
                    error={errors.prenom}
                  />
                  <TextField
                    id='nom'
                    label='Nom'
                    span={4}
                    value={formData.nom}
                    onChange={(v) => handleChange('nom', v)}
                    disabled={changeToDetails}
                    error={errors.nom}
                  />
                  <TextField
                    id='noCIN'
                    label='CIN'
                    span={4}
                    required
                    value={formData.noCIN}
                    onChange={(v) => handleChange('noCIN', v)}
                    disabled={changeToDetails}
                    error={errors.noCIN}
                  />
              <FormGroupTitle>Identification légale</FormGroupTitle>
                  <TextField
                    id='ice'
                    label='ICE'
                    span={4}
                    required
                    value={formData.ice}
                    onChange={(v) => handleChange('ice', v)}
                    disabled={changeToDetails}
                    error={errors.ice}
                  />
                  <TextField
                    id='rc'
                    label='RC'
                    span={4}
                    value={formData.rc}
                    onChange={(v) => handleChange('rc', v)}
                    disabled={changeToDetails}
                    error={errors.rc}
                  />
                  <TextField
                    id='idF'
                    label='IF'
                    span={4}
                    value={formData.idF}
                    onChange={(v) => handleChange('idF', v)}
                    disabled={changeToDetails}
                    error={errors.idF}
                  />
            </FormGrid>
          </FormSection>

          {/* ------------------------------------------------ 2. comment le joindre */}
          <FormSection icon={MapPin} title='Coordonnées' description='Téléphone, e-mail et adresse'>
            <FormGrid>
              <FormGroupTitle>Contact</FormGroupTitle>
                  <TextField
                    id='telephone'
                    label='Téléphone'
                    span={4}
                    inputMode='tel'
                    value={formData.telephone}
                    onChange={(v) => handleChange('telephone', v)}
                    disabled={changeToDetails}
                    error={errors.telephone}
                  />
                  <TextField
                    id='email'
                    label='Email'
                    span={8}
                    inputMode='email'
                    value={formData.email}
                    onChange={(v) => handleChange('email', v)}
                    disabled={changeToDetails}
                    error={errors.email}
                  />
              <FormGroupTitle>Adresse</FormGroupTitle>
                  <TextField
                    id='adresse'
                    label='Adresse'
                    span={12}
                    value={formData.adresse}
                    onChange={(v) => handleChange('adresse', v)}
                    disabled={changeToDetails}
                    error={errors.adresse}
                  />
                  <TextField
                    id='postalCode'
                    label='Code postal'
                    span={4}
                    value={formData.postalCode}
                    onChange={(v) => handleChange('postalCode', v)}
                    disabled={changeToDetails}
                    error={errors.postalCode}
                  />
              <SelectField
                id='noCity'
                label='Ville'
                span={4}
                value={formData.noCity?.toString() || '0'}
                onChange={(v) => handleChange('noCity', v === '0' ? null : Number(v))}
                options={[{ value: '0', label: 'Aucune' }, ...villes.map((v) => ({ value: v.numero.toString(), label: v.designation }))]}
                disabled={changeToDetails}
              />
              <SelectField
                id='noCountry'
                label='Pays'
                span={4}
                value={formData.noCountry?.toString() || '0'}
                onChange={(v) => handleChange('noCountry', v === '0' ? null : Number(v))}
                options={[{ value: '0', label: 'Aucun' }, ...paysList.map((p) => ({ value: p.numero.toString(), label: p.designation }))]}
                disabled={changeToDetails}
              />
            </FormGrid>
          </FormSection>

          {/* ------------------------------------------------ 3. second contact */}
          <FormSection icon={User} title='Autre contact' description='Personne à joindre en second'>
            <FormGrid>
                  <TextField
                    id='autreContactPrenom'
                    label='Prénom'
                    span={4}
                    value={formData.autreContactPrenom}
                    onChange={(v) => handleChange('autreContactPrenom', v)}
                    disabled={changeToDetails}
                    error={errors.autreContactPrenom}
                  />
                  <TextField
                    id='autreContactNom'
                    label='Nom'
                    span={4}
                    value={formData.autreContactNom}
                    onChange={(v) => handleChange('autreContactNom', v)}
                    disabled={changeToDetails}
                    error={errors.autreContactNom}
                  />
                  <TextField
                    id='autreContactPoste'
                    label='Poste'
                    span={4}
                    value={formData.autreContactPoste}
                    onChange={(v) => handleChange('autreContactPoste', v)}
                    disabled={changeToDetails}
                    error={errors.autreContactPoste}
                  />
                  <TextField
                    id='autreContactTelephone'
                    label='Téléphone'
                    span={4}
                    inputMode='tel'
                    value={formData.autreContactTelephone}
                    onChange={(v) => handleChange('autreContactTelephone', v)}
                    disabled={changeToDetails}
                    error={errors.autreContactTelephone}
                  />
                  <TextField
                    id='autreContactEmail'
                    label='Email'
                    span={8}
                    inputMode='email'
                    value={formData.autreContactEmail}
                    onChange={(v) => handleChange('autreContactEmail', v)}
                    disabled={changeToDetails}
                    error={errors.autreContactEmail}
                  />
            </FormGrid>
          </FormSection>

          <FormSection icon={StickyNote} title='Notes'>
            <FormGrid>
              <TextAreaField
                id='notes'
                label='Note'
                value={formData.notes}
                onChange={(v) => handleChange('notes', v)}
                disabled={changeToDetails}
                error={errors.notes}
              />
            </FormGrid>
          </FormSection>

          {/* ------------------------------------------------ pièces du dossier, sur toute la largeur */}
          <FormSection
            icon={FileText}
            title='Dossier administratif'
            description='Pièces à fournir par le locataire'
            aside={
              <span className='rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-400'>
                Taux d'avancement {tauxAvancement} %
              </span>
            }
          >
            <div className='mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted'>
              <div className='h-full rounded-full bg-primary transition-all' style={{ width: `${tauxAvancement}%` }} />
            </div>
            <div className='hidden grid-cols-12 gap-3 pb-2 text-xs font-medium text-muted-foreground md:grid'>
              <div className='col-span-3'>Documents</div>
              <div className='col-span-3'>État du document</div>
              <div className='col-span-6'>Joindre le document</div>
            </div>
            <div className='divide-y'>
              {(
                [
                  { key: 'statutsDispo', label: 'Statuts' },
                  { key: 'rcDispo', label: 'RC' },
                  { key: 'pieceIdentiteDispo', label: 'Copie CIN' },
                  { key: 'autresDispo', label: 'Autres documents' },
                ] as const
              ).map((row) => (
                <div key={row.key} className='grid grid-cols-12 items-center gap-3 py-3'>
                  <div className='col-span-12 text-sm font-medium md:col-span-3'>{row.label}</div>
                  <div className='col-span-12 sm:col-span-5 md:col-span-3'>
                    <Select
                      value={formData[row.key] ? 'true' : 'false'}
                      onValueChange={(value) => handleChange(row.key, value === 'true')}
                      disabled={changeToDetails}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ETATS_DOCUMENT.map((e) => (
                          <SelectItem key={e.label} value={e.value.toString()}>
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='col-span-12 flex items-center gap-2 sm:col-span-7 md:col-span-6'>
                    <Input
                      readOnly
                      value={documentFiles[row.key]?.name ?? ''}
                      placeholder='Aucun fichier sélectionné'
                      className='w-full bg-muted/40'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      disabled={changeToDetails}
                      onClick={() => fileInputRefs.current[row.key]?.click()}
                    >
                      Parcourir
                    </Button>
                    <input
                      type='file'
                      ref={(el) => {
                        fileInputRefs.current[row.key] = el;
                      }}
                      className='hidden'
                      onChange={(e) => setDocumentFiles((prev) => ({ ...prev, [row.key]: e.target.files?.[0] ?? null }))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection icon={Paperclip} title='Autres documents' description='Documents complémentaires'>
            <FormGrid>
              <Field label='Fichier' htmlFor='autreDocumentFichier' span={6}>
                <div className='flex items-center gap-2'>
                  <Input
                    id='autreDocumentFichier'
                    readOnly
                    value={autreDocumentFichier?.name ?? ''}
                    placeholder='Aucun fichier sélectionné'
                    className='w-full bg-muted/40'
                  />
                  <Button type='button' variant='outline' disabled={changeToDetails} onClick={() => autreDocumentInputRef.current?.click()}>
                    Parcourir
                  </Button>
                  <input
                    type='file'
                    ref={autreDocumentInputRef}
                    className='hidden'
                    onChange={(e) => setAutreDocumentFichier(e.target.files?.[0] ?? null)}
                  />
                  <Button
                    type='button'
                    size='icon'
                    disabled={changeToDetails || !autreDocumentFichier}
                    onClick={() => {
                      if (!autreDocumentFichier) return;
                      setAutresDocuments((prev) => [...prev, autreDocumentFichier.name]);
                      setAutreDocumentFichier(null);
                    }}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </Field>
              <Field label='Documents joints' span={6}>
                <div className='flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-muted/20 px-3 py-2 text-sm'>
                  {autresDocuments.length > 0 ? (
                    autresDocuments.map((name, i) => (
                      <span key={i} className='inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium'>
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className='text-muted-foreground'>Aucun document joint</span>
                  )}
                </div>
              </Field>
            </FormGrid>
          </FormSection>
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

      <BaseDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Confirmer la suppression'
        description={`Êtes-vous sûr de vouloir désactiver "${item?.nomAffiche ?? ''}" ?`}
      >
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
            Annuler
          </Button>
          <Button variant='destructive' onClick={confirmDelete}>
            Désactiver
          </Button>
        </div>
      </BaseDialog>
    </Card>
  );
};

export default Form;
