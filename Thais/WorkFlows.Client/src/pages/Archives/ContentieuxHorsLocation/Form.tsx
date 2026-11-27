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
import { Title } from '@/components/ui/title';
import { RootState } from '@/store';
import {
  ContentieuxHorsLocationRequest,
  ContentieuxHorsLocationRequestSchema,
  TYPES_CONTENTIEUX_HORS_LOCATION,
} from '@/store/features/leasing/contentieux-hors-location-schemas';
import {
  createContentieuxHorsLocation,
  editContentieuxHorsLocation,
  getContentieuxHorsLocationById,
} from '@/store/features/leasing/contentieuxHorsLocationSlice';
import { useAppSelector } from '@/store/hooks';
import { Gavel, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import { AppDispatch } from '@/store';

const backPath = '/archives/contentieux-hors-location';

const emptyForm: ContentieuxHorsLocationRequest = {
  locataire: '',
  codeLocataire: '',
  immeuble: '',
  loyerMensuelTTC: null,
  dateDebutImpaye: '',
  dateFinImpaye: '',
  montantLoyerImpaye: null,
  type: 0,
};

const Form = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.contentieuxHorsLocation.item);

  const [formData, setFormData] = useState<ContentieuxHorsLocationRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    if (id) {
      dispatch(getContentieuxHorsLocationById(Number(id)));
    }
  }, [id, dispatch]);

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        locataire: item.locataire ?? '',
        codeLocataire: item.codeLocataire ?? '',
        immeuble: item.immeuble ?? '',
        loyerMensuelTTC: item.loyerMensuelTTC ?? null,
        dateDebutImpaye: item.dateDebutImpaye ? item.dateDebutImpaye.substring(0, 10) : '',
        dateFinImpaye: item.dateFinImpaye ? item.dateFinImpaye.substring(0, 10) : '',
        montantLoyerImpaye: item.montantLoyerImpaye ?? null,
        type: item.type,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof ContentieuxHorsLocationRequest>(
    field: T,
    value: ContentieuxHorsLocationRequest[T],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: ContentieuxHorsLocationRequest) => {
    try {
      ContentieuxHorsLocationRequestSchema.parse(data);
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
      await dispatch(editContentieuxHorsLocation({ id: item.numero, updatedItem: formData })).unwrap();
    } else {
      await dispatch(createContentieuxHorsLocation(formData)).unwrap();
    }

    navigate(backPath);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>
          <Title title={item ? 'Modifier le dossier' : 'Ajouter un dossier de contentieux'} />
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        <form onSubmit={handleSubmit}>
          <Section icon={Gavel} title='Informations'>
            <FormGroupTitle>Locataire</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='locataire' className='text-sm font-medium'>
                Locataire
              </Label>
              <Input
                id='locataire'
                value={formData.locataire ?? ''}
                onChange={(e) => handleChange('locataire', e.target.value)}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='codeLocataire' className='text-sm font-medium'>
                Code Locataire
              </Label>
              <Input
                id='codeLocataire'
                value={formData.codeLocataire ?? ''}
                onChange={(e) => handleChange('codeLocataire', e.target.value)}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='immeuble' className='text-sm font-medium'>
                Actif
              </Label>
              <Input
                id='immeuble'
                value={formData.immeuble ?? ''}
                onChange={(e) => handleChange('immeuble', e.target.value)}
              />
            </div>

            <FormGroupTitle>Contentieux et impayés</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='type' className='text-sm font-medium'>
                Type
              </Label>
              <Select
                value={formData.type.toString()}
                onValueChange={(value) => handleChange('type', Number(value))}
              >
                <SelectTrigger id='type'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_CONTENTIEUX_HORS_LOCATION.map((t) => (
                    <SelectItem key={t.value} value={t.value.toString()}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='loyerMensuelTTC' className='text-sm font-medium'>
                Loyer mensuel TTC (MAD)
              </Label>
              <Input
                id='loyerMensuelTTC'
                type='number'
                step='0.01'
                value={formData.loyerMensuelTTC ?? ''}
                onChange={(e) => handleChange('loyerMensuelTTC', numOrNull(e.target.value))}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateDebutImpaye' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Début impayés
              </Label>
              <Input
                id='dateDebutImpaye'
                type='date'
                value={formData.dateDebutImpaye}
                onChange={(e) => handleChange('dateDebutImpaye', e.target.value)}
                className={errors.dateDebutImpaye ? 'border-red-300' : ''}
              />
              {errors.dateDebutImpaye && <p className='text-red-600 text-sm'>{errors.dateDebutImpaye}</p>}
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateFinImpaye' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Fin impayés
              </Label>
              <Input
                id='dateFinImpaye'
                type='date'
                value={formData.dateFinImpaye}
                onChange={(e) => handleChange('dateFinImpaye', e.target.value)}
                className={errors.dateFinImpaye ? 'border-red-300' : ''}
              />
              {errors.dateFinImpaye && <p className='text-red-600 text-sm'>{errors.dateFinImpaye}</p>}
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='montantLoyerImpaye' className='text-sm font-medium'>
                Montant Loyer impayé (MAD)
              </Label>
              <Input
                id='montantLoyerImpaye'
                type='number'
                step='0.01'
                value={formData.montantLoyerImpaye ?? ''}
                onChange={(e) => handleChange('montantLoyerImpaye', numOrNull(e.target.value))}
              />
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
        <Button onClick={handleSubmit}><Save />{item ? 'Mettre à jour' : 'Sauvegarder'}</Button>
      </CardFooter>
    </Card>
  );
};

export default Form;
