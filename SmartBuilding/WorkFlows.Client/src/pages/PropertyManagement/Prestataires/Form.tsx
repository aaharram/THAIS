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
import { lookupModules } from '@/store/features/configuration/lookupModules';
import {
  PrestataireRequest,
  PrestataireRequestSchema,
} from '@/store/features/property-management/prestataire-schemas';
import {
  createPrestataire,
  editPrestataire,
  getPrestataireById,
  resetPrestataire,
} from '@/store/features/property-management/prestatairesSlice';
import { useAppSelector } from '@/store/hooks';
import { Handshake, Info, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/property-management/prestataires';

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Info;
  title: string;
  children: React.ReactNode;
}) => (
  <div className='border rounded-lg overflow-hidden'>
    <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
      <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
        <Icon className='h-4 w-4' />
      </div>
      <h3 className='text-base font-semibold text-gray-900'>{title}</h3>
    </div>
    <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4'>{children}</div>
  </div>
);

const emptyForm: PrestataireRequest = {
  designation: '',
  activite: '',
  typePrestataire: '',
  enseigne: '',
  rc: '',
  idf: '',
  ice: '',
  adresse: '',
  postalCode: '',
  noVille: null,
  pays: '',
  notes: '',
};

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.prestataires.item);
  const { allItems: villes } = useAppSelector((state) => state.cfgVilles);

  const [formData, setFormData] = useState<PrestataireRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(lookupModules.cfgVilles.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getPrestataireById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        designation: item.designation,
        activite: item.activite ?? '',
        typePrestataire: item.typePrestataire ?? '',
        enseigne: item.enseigne ?? '',
        rc: item.rc ?? '',
        idf: item.idf ?? '',
        ice: item.ice ?? '',
        adresse: item.adresse ?? '',
        postalCode: item.postalCode ?? '',
        noVille: item.noVille ?? null,
        pays: item.pays ?? '',
        notes: item.notes ?? '',
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof PrestataireRequest>(field: T, value: PrestataireRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: PrestataireRequest) => {
    try {
      PrestataireRequestSchema.parse(data);
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
      await dispatch(editPrestataire({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetPrestataire());
    } else {
      await dispatch(createPrestataire(formData)).unwrap();
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
                ? `Détails prestataire — ${item?.designation ?? ''}`
                : item
                ? `Modifier prestataire — ${item.designation ?? ''}`
                : 'Ajouter un prestataire'
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
          <Section icon={Handshake} title='Informations'>
            <div className='space-y-2'>
              <Label htmlFor='designation' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Désignation
              </Label>
              <Input
                id='designation'
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                disabled={changeToDetails}
                className={errors.designation ? 'border-red-300' : ''}
              />
              {errors.designation && <p className='text-red-600 text-sm'>{errors.designation}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='enseigne' className='text-sm font-medium'>
                Enseigne
              </Label>
              <Input
                id='enseigne'
                value={formData.enseigne ?? ''}
                onChange={(e) => handleChange('enseigne', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='activite' className='text-sm font-medium'>
                Activité
              </Label>
              <Input
                id='activite'
                value={formData.activite ?? ''}
                onChange={(e) => handleChange('activite', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='typePrestataire' className='text-sm font-medium'>
                Type de prestataire
              </Label>
              <Input
                id='typePrestataire'
                value={formData.typePrestataire ?? ''}
                onChange={(e) => handleChange('typePrestataire', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='rc' className='text-sm font-medium'>
                RC
              </Label>
              <Input
                id='rc'
                value={formData.rc ?? ''}
                onChange={(e) => handleChange('rc', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='idf' className='text-sm font-medium'>
                IDF
              </Label>
              <Input
                id='idf'
                value={formData.idf ?? ''}
                onChange={(e) => handleChange('idf', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='ice' className='text-sm font-medium'>
                ICE
              </Label>
              <Input
                id='ice'
                value={formData.ice ?? ''}
                onChange={(e) => handleChange('ice', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='adresse' className='text-sm font-medium'>
                Adresse
              </Label>
              <Input
                id='adresse'
                value={formData.adresse ?? ''}
                onChange={(e) => handleChange('adresse', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='postalCode' className='text-sm font-medium'>
                Code postal
              </Label>
              <Input
                id='postalCode'
                value={formData.postalCode ?? ''}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noVille' className='text-sm font-medium'>
                Ville
              </Label>
              <Select
                value={formData.noVille?.toString() || '0'}
                onValueChange={(value) => handleChange('noVille', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noVille'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucune</SelectItem>
                  {villes.map((v) => (
                    <SelectItem key={v.numero} value={v.numero.toString()}>
                      {v.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='pays' className='text-sm font-medium'>
                Pays
              </Label>
              <Input
                id='pays'
                value={formData.pays ?? ''}
                onChange={(e) => handleChange('pays', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2 col-span-full'>
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
          </Section>
        </form>
      </CardContent>
      <Separator />
      <CardFooter className='flex justify-end gap-2 mt-6'>
        <Button variant='secondary' onClick={() => navigate(backPath)}>
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
