import { GridSection as Section, FormGroupTitle } from '@/components/form/form-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { RootState } from '@/store';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import {
  DEMANDES_LOCAL,
  ETATS_LOCAL,
  LocalRequest,
  LocalRequestSchema,
} from '@/store/features/patrimoine/local-schemas';
import {
  createLocal,
  editLocal,
  getLocalById,
  resetLocal,
} from '@/store/features/patrimoine/locauxSlice';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ArrowLeft, DollarSign, Download, FolderOpen, Home, Info, Loader2, Save } from 'lucide-react';
import { downloadAttachment, uploadAttachment } from '@/store/services/attachments';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { z } from 'zod';

const backPath = '/patrimoine/locaux';
const ATTACHMENT_FOLDER = 'locaux';

const emptyForm: LocalRequest = {
  noBuilding: 0,
  noLocalType: null,
  designation: '',
  enExploitation: false,
  nondisponible: false,
  moyensGeneraux: false,
  mettreEnLocation: false,
  responsable: '',
  nbrePiece: null,
  surface: null,
  terrasse: null,
  address1: '',
  titreFoncier: '',
  aVendre: false,
  etage: '',
  dateModificationValeur: '',
  notes: '',
  dernierLoyer: null,
  valeurEntree: null,
  valeurInventaire: null,
  valeurRealisation: null,
  observation: '',
  etat: null,
  demande: null,
  suggestion: '',
  montantAmenagement: null,
  offreLoyerHT: null,
  offreCharge: null,
  tva: null,
  offreTSC: null,
  inactif: false,
};

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // Image et plan du local (RMANew DataEntryLocaux : LXImage / LXPlan)
  const [pickedNames, setPickedNames] = useState<Partial<Record<'image' | 'planLocal', string>>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const handleFile = async (field: 'image' | 'planLocal', file: File) => {
    setUploadingField(field);
    try {
      const stored = await uploadAttachment(ATTACHMENT_FOLDER, file);
      setFormData((prev) => ({ ...prev, [field]: stored }));
      setPickedNames((prev) => ({ ...prev, [field]: file.name }));
    } finally {
      setUploadingField(null);
    }
  };

  const item = useAppSelector((state: RootState) => state.locaux.item);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: localTypes } = useAppSelector((state) => state.cfgTypologiesLot);

  const preselectedBuilding = Number(searchParams.get('building')) || 0;

  const [formData, setFormData] = useState<LocalRequest>({
    ...emptyForm,
    noBuilding: preselectedBuilding,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 100 }));
    dispatch(lookupModules.cfgTypologiesLot.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getLocalById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noBuilding: item.noBuilding,
        noLocalType: item.noLocalType ?? null,
        designation: item.designation,
        enExploitation: item.enExploitation,
        nondisponible: item.nondisponible,
        moyensGeneraux: item.moyensGeneraux,
        mettreEnLocation: item.mettreEnLocation,
        responsable: item.responsable ?? '',
        nbrePiece: item.nbrePiece ?? null,
        surface: item.surface ?? null,
        terrasse: item.terrasse ?? null,
        address1: item.address1 ?? '',
        titreFoncier: item.titreFoncier ?? '',
        aVendre: item.aVendre,
        etage: item.etage ?? '',
        dateModificationValeur: item.dateModificationValeur
          ? item.dateModificationValeur.substring(0, 10)
          : '',
        notes: item.notes ?? '',
        dernierLoyer: item.dernierLoyer ?? null,
        valeurEntree: item.valeurEntree ?? null,
        valeurInventaire: item.valeurInventaire ?? null,
        valeurRealisation: item.valeurRealisation ?? null,
        observation: item.observation ?? '',
        image: item.image ?? null,
        planLocal: item.planLocal ?? null,
        etat: item.etat ?? null,
        demande: item.demande ?? null,
        suggestion: item.suggestion ?? '',
        montantAmenagement: item.montantAmenagement ?? null,
        offreLoyerHT: item.offreLoyerHT ?? null,
        offreCharge: item.offreCharge ?? null,
        tva: item.tva ?? null,
        offreTSC: item.offreTSC ?? null,
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof LocalRequest>(field: T, value: LocalRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  // Même calcul d'affichage que RMANew (DataEntryLocaux.AfterGenerate) :
  // surface + moitié de la terrasse/mezzanine si renseignée. Non persisté.
  const surfacePonderee =
    (formData.surface ?? 0) + (formData.terrasse && formData.terrasse > 0 ? formData.terrasse / 2 : 0);

  const validate = (data: LocalRequest) => {
    try {
      LocalRequestSchema.parse(data);
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
      await dispatch(editLocal({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetLocal());
    } else {
      await dispatch(createLocal(formData)).unwrap();
    }

    navigate(backPath);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle className='flex justify-between'>
          <Title
            title={
              changeToDetails
                ? `Détails "${formData.designation}"`
                : item
                ? `Modifier "${formData.designation}"`
                : 'Ajouter un local'
            }
          />
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <Section icon={Home} title='Informations'>
            <FormGroupTitle>Rattachement</FormGroupTitle>

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
              {errors.noBuilding && <p className='text-red-600 text-sm'>{errors.noBuilding}</p>}
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='noLocalType' className='text-sm font-medium'>
                Type Local
              </Label>
              <Select
                value={formData.noLocalType?.toString() || '0'}
                onValueChange={(value) => handleChange('noLocalType', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noLocalType'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucun</SelectItem>
                  {localTypes.map((t) => (
                    <SelectItem key={t.numero} value={t.numero.toString()}>
                      {t.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='designation' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Nom du local
              </Label>
              <Input
                id='designation'
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                disabled={changeToDetails}
                className={errors.designation ? 'border-red-300 focus:border-red-500' : ''}
              />
              {errors.designation && <p className='text-red-600 text-sm'>{errors.designation}</p>}
            </div>

            <FormGroupTitle>Caractéristiques</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='etage' className='text-sm font-medium'>
                Etage
              </Label>
              <Input
                id='etage'
                value={formData.etage ?? ''}
                onChange={(e) => handleChange('etage', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='surface' className='text-sm font-medium'>
                Superficie
              </Label>
              <Input
                id='surface'
                type='number'
                step='0.01'
                value={formData.surface ?? ''}
                onChange={(e) => handleChange('surface', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='terrasse' className='text-sm font-medium'>
                Terrasse/Mezzanine
              </Label>
              <Input
                id='terrasse'
                type='number'
                step='0.01'
                value={formData.terrasse ?? ''}
                onChange={(e) => handleChange('terrasse', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label className='text-sm font-medium'>Surface pondérée</Label>
              <Input value={surfacePonderee || '-'} readOnly disabled className='bg-gray-50' />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='nbrePiece' className='text-sm font-medium'>
                Nbr place parking
              </Label>
              <Input
                id='nbrePiece'
                type='number'
                value={formData.nbrePiece ?? ''}
                onChange={(e) => handleChange('nbrePiece', numOrNull(e.target.value) as number | null)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='titreFoncier' className='text-sm font-medium'>
                Titre Foncier
              </Label>
              <div className='flex items-center gap-3'>
                <Input
                  id='titreFoncier'
                  value={formData.titreFoncier ?? ''}
                  onChange={(e) => handleChange('titreFoncier', e.target.value)}
                  disabled={changeToDetails}
                  className='flex-1'
                />
                <label className='flex items-center gap-2 text-sm whitespace-nowrap'>
                  <Checkbox
                    checked={formData.aVendre}
                    onCheckedChange={(c) => handleChange('aVendre', c === true)}
                    disabled={changeToDetails}
                  />
                  A Vendre
                </label>
              </div>
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='responsable' className='text-sm font-medium'>
                Gestionnaire
              </Label>
              <Input
                id='responsable'
                value={formData.responsable ?? ''}
                onChange={(e) => handleChange('responsable', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateModificationValeur' className='text-sm font-medium'>
                Date Modification
              </Label>
              <Input
                id='dateModificationValeur'
                type='date'
                value={formData.dateModificationValeur ?? ''}
                onChange={(e) => handleChange('dateModificationValeur', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='col-span-12'>
            <div className='grid grid-cols-2 gap-3 sm:pt-8'>
              {(
                [
                  ['enExploitation', 'En exploitation'],
                  ['nondisponible', 'Non disponible'],
                  ['moyensGeneraux', 'Moyens Généraux'],
                  ['mettreEnLocation', 'Mettre en location'],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className='flex items-center gap-2 text-sm'>
                  <Checkbox
                    checked={formData[field]}
                    onCheckedChange={(c) => handleChange(field, c === true)}
                    disabled={changeToDetails}
                  />
                  {label}
                </label>
              ))}
            </div>
            </div>

            <FormGroupTitle>Adresse et documents</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12'>
              <Label htmlFor='address1' className='text-sm font-medium'>
                Adresse
              </Label>
              <Input
                id='address1'
                value={formData.address1 ?? ''}
                onChange={(e) => handleChange('address1', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            {(
              [
                ['image', 'Image'],
                ['planLocal', 'Plan'],
              ] as const
            ).map(([field, label]) => (
              <div key={field} className='min-w-0 space-y-1.5 col-span-12 md:col-span-6'>
                <Label htmlFor={field} className='text-sm font-medium'>
                  {label}
                </Label>
                <div className='flex items-center gap-1'>
                  <Input id={field} readOnly value={pickedNames[field] ?? (formData[field] ? label : '')} className='flex-1 min-w-0 bg-gray-50' />
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
                  {!changeToDetails && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='h-8 px-2 shrink-0 text-blue-600 hover:text-sky-700 dark:text-sky-400 hover:bg-sky-500/10'
                      disabled={uploadingField === field}
                      onClick={() => fileInputs.current[field]?.click()}
                    >
                      {uploadingField === field ? <Loader2 className='h-4 w-4 mr-1 animate-spin' /> : <FolderOpen className='h-4 w-4 mr-1' />}
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
              </div>
            ))}

            <div className='min-w-0 space-y-1.5 col-span-12'>
              <Label htmlFor='notes' className='text-sm font-medium'>
                Description
              </Label>
              <Textarea
                id='notes'
                rows={3}
                value={formData.notes ?? ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
          </Section>

          <Section icon={Info} title="En complément d'information">
            <FormGroupTitle>Valeurs</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='valeurEntree' className='text-sm font-medium'>
                Valeur d'entrée
              </Label>
              <Input
                id='valeurEntree'
                type='number'
                step='0.01'
                value={formData.valeurEntree ?? ''}
                onChange={(e) => handleChange('valeurEntree', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='valeurInventaire' className='text-sm font-medium'>
                Valeur inventaire
              </Label>
              <Input
                id='valeurInventaire'
                type='number'
                step='0.01'
                value={formData.valeurInventaire ?? ''}
                onChange={(e) => handleChange('valeurInventaire', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='valeurRealisation' className='text-sm font-medium'>
                Valeur réalisation
              </Label>
              <Input
                id='valeurRealisation'
                type='number'
                step='0.01'
                value={formData.valeurRealisation ?? ''}
                onChange={(e) => handleChange('valeurRealisation', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='montantAmenagement' className='text-sm font-medium'>
                Montant Aménagement
              </Label>
              <Input
                id='montantAmenagement'
                type='number'
                step='0.01'
                value={formData.montantAmenagement ?? ''}
                onChange={(e) => handleChange('montantAmenagement', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <FormGroupTitle>Exploitation</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label className='text-sm font-medium'>Dernier Loyer</Label>
              <Input value={formData.dernierLoyer ?? '-'} readOnly disabled className='bg-gray-50' />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='etat' className='text-sm font-medium'>
                Etat
              </Label>
              <Select
                value={formData.etat ?? ''}
                onValueChange={(value) => handleChange('etat', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='etat'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {ETATS_LOCAL.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='demande' className='text-sm font-medium'>
                Demande
              </Label>
              <Select
                value={formData.demande ?? ''}
                onValueChange={(value) => handleChange('demande', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='demande'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {DEMANDES_LOCAL.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='suggestion' className='text-sm font-medium'>
                Suggestion
              </Label>
              <Input
                id='suggestion'
                value={formData.suggestion ?? ''}
                onChange={(e) => handleChange('suggestion', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12'>
              <Label htmlFor='observation' className='text-sm font-medium'>
                Observation
              </Label>
              <Textarea
                id='observation'
                rows={3}
                value={formData.observation ?? ''}
                onChange={(e) => handleChange('observation', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
          </Section>

          <Section icon={DollarSign} title='Offre financière'>
            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='offreLoyerHT' className='text-sm font-medium'>
                Loyer HTHC
              </Label>
              <Input
                id='offreLoyerHT'
                type='number'
                step='0.01'
                value={formData.offreLoyerHT ?? ''}
                onChange={(e) => handleChange('offreLoyerHT', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='offreCharge' className='text-sm font-medium'>
                Charges
              </Label>
              <Input
                id='offreCharge'
                type='number'
                step='0.01'
                value={formData.offreCharge ?? ''}
                onChange={(e) => handleChange('offreCharge', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='tva' className='text-sm font-medium'>
                TVA
              </Label>
              <Input
                id='tva'
                type='number'
                step='0.01'
                value={formData.tva ?? ''}
                onChange={(e) => handleChange('tva', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='offreTSC' className='text-sm font-medium'>
                TSC 10,5%
              </Label>
              <Input
                id='offreTSC'
                type='number'
                step='0.01'
                value={formData.offreTSC ?? ''}
                onChange={(e) => handleChange('offreTSC', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label className='text-sm font-medium'>Loyer TCTC</Label>
              <Input value={item?.offreLoyerTTC ?? '-'} readOnly disabled className='bg-gray-50' />
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
