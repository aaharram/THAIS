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
import { Title } from '@/components/ui/title';
import { RootState } from '@/store';
import {
  ExpertiseRequest,
  ExpertiseRequestSchema,
} from '@/store/features/patrimoine/expertise-schemas';
import {
  createExpertise,
  editExpertise,
  getExpertiseById,
  resetExpertise,
} from '@/store/features/patrimoine/expertisesSlice';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { getAllLocaux } from '@/store/features/patrimoine/locauxSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { downloadAttachment, uploadAttachment } from '@/store/services/attachments';
import { Download, FolderOpen, Info, Loader2, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { z } from 'zod';

const backPath = '/patrimoine/expertises';
const ATTACHMENT_FOLDER = 'expertises';

const emptyForm: ExpertiseRequest = {
  cabinetExpert: '',
  noBuilding: 0,
  noLocal: 0,
  valeurTerrain: null,
  valeurConstruction: null,
  valeurExpertiseActualiser: null,
  dateExpertiseActualiser: '',
  pieceJointe: '',
};

const Form = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const item =useAppSelector((state: RootState) => state.expertises.item);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: locaux } = useAppSelector((state) => state.locaux);

  const preselectedBuilding = Number(searchParams.get('building')) || 0;
  const preselectedLocal = Number(searchParams.get('local')) || 0;

  const [formData, setFormData] = useState<ExpertiseRequest>({
    ...emptyForm,
    noBuilding: preselectedBuilding,
    noLocal: preselectedLocal,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getExpertiseById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (formData.noBuilding) {
      dispatch(
        getAllLocaux({ pageNumber: 1, pageSize: 100, filters: { NoBuilding: [formData.noBuilding] } }),
      );
    }
  }, [formData.noBuilding, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        cabinetExpert: item.cabinetExpert,
        noBuilding: item.noBuilding,
        noLocal: item.noLocal,
        valeurTerrain: item.valeurTerrain ?? null,
        valeurConstruction: item.valeurConstruction ?? null,
        valeurExpertiseActualiser: item.valeurExpertiseActualiser ?? null,
        dateExpertiseActualiser: item.dateExpertiseActualiser
          ? item.dateExpertiseActualiser.substring(0, 10)
          : '',
        pieceJointe: item.pieceJointe ?? '',
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof ExpertiseRequest>(field: T, value: ExpertiseRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

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

  const validate = (data: ExpertiseRequest) => {
    try {
      ExpertiseRequestSchema.parse(data);
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
      await dispatch(editExpertise({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetExpertise());
    } else {
      await dispatch(createExpertise(formData)).unwrap();
    }

    navigate(backPath);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>
          <Title title={item ? "Modifier l'expertise" : 'Ajouter une expertise'} />
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className='py-6 px-4 sm:px-6'>
        <form onSubmit={handleSubmit}>
          <div className='border rounded-lg overflow-hidden'>
            <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
              <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
                <Info className='h-4 w-4' />
              </div>
              <h3 className='text-base font-semibold text-gray-900'>Informations</h3>
            </div>

            <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 [&_input:not([type=checkbox])]:w-full [&_[role=combobox]]:w-full [&_textarea]:w-full'>
              <div className='space-y-2'>
                <Label htmlFor='cabinetExpert' className='text-sm font-medium'>
                  <span className='text-red-500'>* </span>Cabinet d'expert
                </Label>
                <Input
                  id='cabinetExpert'
                  value={formData.cabinetExpert}
                  onChange={(e) => handleChange('cabinetExpert', e.target.value)}
                  className={errors.cabinetExpert ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.cabinetExpert && <p className='text-red-600 text-sm'>{errors.cabinetExpert}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='noBuilding' className='text-sm font-medium'>
                  <span className='text-red-500'>* </span>Actif
                </Label>
                <Select
                  value={formData.noBuilding ? formData.noBuilding.toString() : ''}
                  onValueChange={(value) => {
                    handleChange('noBuilding', Number(value));
                    handleChange('noLocal', 0);
                  }}
                >
                  <SelectTrigger id='noBuilding' className={errors.noBuilding ? 'border-red-300' : ''}>
                    <SelectValue placeholder='Tous les actifs' />
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

              <div className='space-y-2'>
                <Label htmlFor='noLocal' className='text-sm font-medium'>
                  <span className='text-red-500'>* </span>Local
                </Label>
                <Select
                  value={formData.noLocal ? formData.noLocal.toString() : ''}
                  onValueChange={(value) => handleChange('noLocal', Number(value))}
                  disabled={!formData.noBuilding}
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
                {errors.noLocal && <p className='text-red-600 text-sm'>{errors.noLocal}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='valeurTerrain' className='text-sm font-medium'>
                  Valeur Terrain
                </Label>
                <Input
                  id='valeurTerrain'
                  type='number'
                  step='0.01'
                  value={formData.valeurTerrain ?? ''}
                  onChange={(e) => handleChange('valeurTerrain', numOrNull(e.target.value))}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='valeurConstruction' className='text-sm font-medium'>
                  Valeur Construction
                </Label>
                <Input
                  id='valeurConstruction'
                  type='number'
                  step='0.01'
                  value={formData.valeurConstruction ?? ''}
                  onChange={(e) => handleChange('valeurConstruction', numOrNull(e.target.value))}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='valeurExpertiseActualiser' className='text-sm font-medium'>
                  Nouvelle Expt
                </Label>
                <Input
                  id='valeurExpertiseActualiser'
                  type='number'
                  step='0.01'
                  value={formData.valeurExpertiseActualiser ?? ''}
                  onChange={(e) => handleChange('valeurExpertiseActualiser', numOrNull(e.target.value))}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='dateExpertiseActualiser' className='text-sm font-medium'>
                  Date Nouvelle Expt
                </Label>
                <Input
                  id='dateExpertiseActualiser'
                  type='date'
                  value={formData.dateExpertiseActualiser ?? ''}
                  onChange={(e) => handleChange('dateExpertiseActualiser', e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='pieceJointe' className='text-sm font-medium'>
                  Pièce jointe
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
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <Loader2 className='h-4 w-4 mr-1 animate-spin' />
                      ) : (
                        <FolderOpen className='h-4 w-4 mr-1' />
                      )}
                      Parcourir
                    </Button>
                  </div>
                  <input ref={fileInputRef} type='file' className='hidden' onChange={handleFileSelected} />
                </div>
                {uploadError && <p className='text-red-600 text-sm'>{uploadError}</p>}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <Separator />
      <CardFooter className='flex justify-end gap-2 mt-6'>
        <Button variant='outline'
          className='border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary' onClick={() => navigate(backPath)}>
          <ArrowLeft />
          Retour
        </Button>
        <Button onClick={handleSubmit}><Save />{item ? 'Mettre à jour' : 'Sauvegarder'}</Button>
      </CardFooter>
    </Card>
  );
};

export default Form;
