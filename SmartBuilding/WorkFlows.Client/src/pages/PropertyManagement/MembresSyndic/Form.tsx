import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/title';
import { AppDispatch, RootState } from '@/store';
import { SyndicRequest, SyndicRequestSchema } from '@/store/features/property-management/syndic-schemas';
import {
  createSyndic,
  editSyndic,
  getSyndicById,
  resetSyndic,
} from '@/store/features/property-management/syndicsSlice';
import { useAppSelector } from '@/store/hooks';
import { Info, Users, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/property-management/membres-syndic';

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

const emptyForm: SyndicRequest = {
  nom: '',
  prenom: '',
  poste: '',
  telephone: '',
  debutMandat: '',
  finMandat: '',
  notes: '',
  inactif: false,
};

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.syndicsPm.item);

  const [formData, setFormData] = useState<SyndicRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    if (id) {
      dispatch(getSyndicById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        nom: item.nom ?? '',
        prenom: item.prenom ?? '',
        poste: item.poste ?? '',
        telephone: item.telephone ?? '',
        debutMandat: item.debutMandat ? item.debutMandat.substring(0, 10) : '',
        finMandat: item.finMandat ? item.finMandat.substring(0, 10) : '',
        notes: item.notes ?? '',
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof SyndicRequest>(field: T, value: SyndicRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: SyndicRequest) => {
    try {
      SyndicRequestSchema.parse(data);
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
      await dispatch(editSyndic({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetSyndic());
    } else {
      await dispatch(createSyndic(formData)).unwrap();
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
                ? `Détails membre — ${item?.nom ?? ''}`
                : item
                ? `Modifier membre — ${item.nom ?? ''}`
                : 'Ajouter un membre du syndic'
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
          <Section icon={Users} title='Informations'>
            <div className='space-y-2'>
              <Label htmlFor='nom' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Nom
              </Label>
              <Input
                id='nom'
                value={formData.nom ?? ''}
                onChange={(e) => handleChange('nom', e.target.value)}
                disabled={changeToDetails}
                className={errors.nom ? 'border-red-300' : ''}
              />
              {errors.nom && <p className='text-red-600 text-sm'>{errors.nom}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='prenom' className='text-sm font-medium'>
                Prénom
              </Label>
              <Input
                id='prenom'
                value={formData.prenom ?? ''}
                onChange={(e) => handleChange('prenom', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='poste' className='text-sm font-medium'>
                Poste
              </Label>
              <Input
                id='poste'
                value={formData.poste ?? ''}
                onChange={(e) => handleChange('poste', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='telephone' className='text-sm font-medium'>
                Téléphone
              </Label>
              <Input
                id='telephone'
                value={formData.telephone ?? ''}
                onChange={(e) => handleChange('telephone', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='debutMandat' className='text-sm font-medium'>
                Début mandat
              </Label>
              <Input
                id='debutMandat'
                type='date'
                value={formData.debutMandat ?? ''}
                onChange={(e) => handleChange('debutMandat', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='finMandat' className='text-sm font-medium'>
                Fin mandat
              </Label>
              <Input
                id='finMandat'
                type='date'
                value={formData.finMandat ?? ''}
                onChange={(e) => handleChange('finMandat', e.target.value)}
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
