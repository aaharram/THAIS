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
import { getAllLocataires } from '@/store/features/leasing/locatairesSlice';
import {
  ETATS_RECLAMATION,
  ReclamationRequest,
  ReclamationRequestSchema,
} from '@/store/features/property-management/reclamation-schemas';
import {
  createReclamation,
  editReclamation,
  getReclamationById,
  resetReclamation,
} from '@/store/features/property-management/reclamationsSlice';
import { useAppSelector } from '@/store/hooks';
import { MessageSquareWarning, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/property-management/reclamations';

const emptyForm: ReclamationRequest = {
  noBuilding: 0,
  noLocal: null,
  noLocataire: 0,
  etat: 'Ouverte',
  dateReclamation: '',
  objet: '',
  notes: '',
};

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.reclamationsPm.item);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: locaux } = useAppSelector((state) => state.locaux);
  const { allItems: locataires } = useAppSelector((state) => state.locataires);

  const [formData, setFormData] = useState<ReclamationRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 1000 }));
    dispatch(getAllLocaux({ pageNumber: 1, pageSize: 1000 }));
    dispatch(getAllLocataires({ pageNumber: 1, pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getReclamationById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noBuilding: item.noBuilding,
        noLocal: item.noLocal ?? null,
        noLocataire: item.noLocataire,
        etat: item.etat,
        dateReclamation: item.dateReclamation ? item.dateReclamation.substring(0, 10) : '',
        objet: item.objet ?? '',
        notes: item.notes ?? '',
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof ReclamationRequest>(field: T, value: ReclamationRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const localsForBuilding = locaux.filter((l) => l.noBuilding === formData.noBuilding);

  const validate = (data: ReclamationRequest) => {
    try {
      ReclamationRequestSchema.parse(data);
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
      await dispatch(editReclamation({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetReclamation());
    } else {
      await dispatch(createReclamation(formData)).unwrap();
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
                ? 'Détails réclamation'
                : item
                ? 'Modifier réclamation'
                : 'Ajouter une réclamation'
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
          <Section icon={MessageSquareWarning} title='Informations'>
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
              <Label htmlFor='noLocataire' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Locataire
              </Label>
              <Select
                value={formData.noLocataire ? formData.noLocataire.toString() : ''}
                onValueChange={(value) => handleChange('noLocataire', Number(value))}
                disabled={changeToDetails}
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
              {errors.noLocataire && <p className='text-red-600 text-sm'>{errors.noLocataire}</p>}
            </div>

            <FormGroupTitle>Réclamation</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='etat' className='text-sm font-medium'>
                État
              </Label>
              <Select
                value={formData.etat ?? 'Ouverte'}
                onValueChange={(value) => handleChange('etat', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='etat'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ETATS_RECLAMATION.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              <Label htmlFor='objet' className='text-sm font-medium'>
                Objet
              </Label>
              <Input
                id='objet'
                value={formData.objet ?? ''}
                onChange={(e) => handleChange('objet', e.target.value)}
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
