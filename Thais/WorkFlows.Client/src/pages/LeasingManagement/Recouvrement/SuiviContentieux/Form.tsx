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
import {
  STATUTS_DOSSIER,
  SuiviContentieuxRequest,
  SuiviContentieuxRequestSchema,
} from '@/store/features/leasing/suivi-contentieux-schemas';
import {
  createSuiviContentieux,
  editSuiviContentieux,
  getSuiviContentieuxById,
  resetSuiviContentieux,
} from '@/store/features/leasing/suiviContentieuxSlice';
import { useAppSelector } from '@/store/hooks';
import { downloadAttachment, uploadAttachment } from '@/store/services/attachments';
import { Download, FolderOpen, Gavel, Loader2, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';

const backPath = '/leasing-management/recouvrement/suivi-contentieux';
const ATTACHMENT_FOLDER = 'suivi-contentieux';

const emptyForm: SuiviContentieuxRequest = {
  noLocation: null,
  natureProcedure: '',
  observation: '',
  description: '',
  statutDossier: 'En Contentieux',
  dateDebutContentieux: '',
  dateEncaissement: '',
  montantEncaisse: null,
  soldeAnneePrecedente: null,
  pieceJointe: '',
};

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);

  const item = useAppSelector((state: RootState) => state.suiviContentieux.item);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SuiviContentieuxRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    if (id) {
      dispatch(getSuiviContentieuxById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noLocation: item.noLocation,
        natureProcedure: item.natureProcedure ?? '',
        observation: item.observation ?? '',
        description: item.description ?? '',
        statutDossier: item.statutDossier,
        dateDebutContentieux: item.dateDebutContentieux ? item.dateDebutContentieux.substring(0, 10) : '',
        dateEncaissement: item.dateEncaissement ? item.dateEncaissement.substring(0, 10) : '',
        montantEncaisse: item.montantEncaisse ?? null,
        soldeAnneePrecedente: item.soldeAnneePrecedente ?? null,
        pieceJointe: item.pieceJointe ?? '',
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof SuiviContentieuxRequest>(field: T, value: SuiviContentieuxRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const fileName = await uploadAttachment(ATTACHMENT_FOLDER, file);
      handleChange('pieceJointe', fileName);
    } catch {
      setUploadError("Échec de l'envoi du fichier.");
    } finally {
      setUploading(false);
    }
  };

  const validate = (data: SuiviContentieuxRequest) => {
    return SuiviContentieuxRequestSchema.safeParse(data).success;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(formData)) return;

    if (item) {
      await dispatch(editSuiviContentieux({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetSuiviContentieux());
    } else {
      await dispatch(createSuiviContentieux(formData)).unwrap();
    }

    navigate(backPath);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle className='flex justify-between'>
          <Title
            icon={Gavel}
            title={
              changeToDetails
                ? 'Détails dossier contentieux'
                : item
                  ? 'Modifier dossier contentieux'
                  : 'Ajouter un dossier contentieux'
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
          <Section icon={Gavel} title='Informations'>
            {/* Ordre des champs ci-dessous : identique à DataEntrySuiviJuridique.aspx
                (Suivi, Nature procedure, Statut Dossier, Date de Encaissement, Date début
                contentieux, Solde Année Précédente, Montant Encaissé, Description). */}

            <FormGroupTitle>Dossier</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='natureProcedure' className='text-sm font-medium'>
                Nature procedure
              </Label>
              <Textarea
                id='natureProcedure'
                rows={3}
                value={formData.natureProcedure ?? ''}
                onChange={(e) => handleChange('natureProcedure', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='statutDossier' className='text-sm font-medium'>
                Statut Dossier
              </Label>
              <Select
                value={formData.statutDossier ?? 'En Contentieux'}
                onValueChange={(value) => handleChange('statutDossier', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='statutDossier'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS_DOSSIER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateDebutContentieux' className='text-sm font-medium'>
                Date début contentieux
              </Label>
              <Input
                id='dateDebutContentieux'
                type='date'
                value={formData.dateDebutContentieux ?? ''}
                onChange={(e) => handleChange('dateDebutContentieux', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12'>
              <Label htmlFor='observation' className='text-sm font-medium'>
                Suivi
              </Label>
              <Textarea
                id='observation'
                rows={4}
                value={formData.observation ?? ''}
                onChange={(e) => handleChange('observation', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <FormGroupTitle>Encaissement</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateEncaissement' className='text-sm font-medium'>
                Date de Encaissement
              </Label>
              <Input
                id='dateEncaissement'
                type='date'
                value={formData.dateEncaissement ?? ''}
                onChange={(e) => handleChange('dateEncaissement', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='soldeAnneePrecedente' className='text-sm font-medium'>
                Solde Année Précédente
              </Label>
              <Input
                id='soldeAnneePrecedente'
                type='number'
                step='0.01'
                value={formData.soldeAnneePrecedente ?? ''}
                onChange={(e) => handleChange('soldeAnneePrecedente', e.target.value ? Number(e.target.value) : null)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='montantEncaisse' className='text-sm font-medium'>
                Montant Encaissé
              </Label>
              <Input
                id='montantEncaisse'
                type='number'
                step='0.01'
                value={formData.montantEncaisse ?? ''}
                onChange={(e) => handleChange('montantEncaisse', e.target.value ? Number(e.target.value) : null)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12'>
              <Label htmlFor='description' className='text-sm font-medium'>
                Description
              </Label>
              <Textarea
                id='description'
                rows={4}
                value={formData.description ?? ''}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            {/* RMANew (champ "Pieces jointe") : stockage physique + nom généré en base,
                sur le même modèle que ProfileController (photo de profil). */}

            <div className='min-w-0 space-y-1.5 col-span-12'>
              <Label htmlFor='pieceJointe' className='text-sm font-medium'>
                Pieces jointe
              </Label>
              <div className='relative w-full'>
                <input
                  id='pieceJointe'
                  readOnly
                  value={formData.pieceJointe ?? ''}
                  className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-40 text-base shadow-sm md:text-sm'
                />
                <div className='absolute inset-y-0 right-1 flex items-center gap-1'>
                  {formData.pieceJointe && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      title='Télécharger'
                      onClick={() => downloadAttachment(ATTACHMENT_FOLDER, formData.pieceJointe!)}
                    >
                      <Download className='h-4 w-4' />
                    </Button>
                  )}
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='h-7 px-2 text-blue-600 hover:text-sky-700 dark:text-sky-400 hover:bg-sky-500/10'
                    disabled={changeToDetails || uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? <Loader2 className='h-4 w-4 mr-1 animate-spin' /> : <FolderOpen className='h-4 w-4 mr-1' />}
                    Parcourir
                  </Button>
                </div>
                <input ref={fileInputRef} type='file' className='hidden' onChange={handleFileSelected} />
              </div>
              {uploadError && <p className='text-red-600 text-sm'>{uploadError}</p>}
            </div>
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
