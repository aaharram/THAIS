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
import { AppDispatch, RootState } from '@/store';
import { getAllBaux } from '@/store/features/leasing/bauxSlice';
import {
  STATUTS_SUSPENSION,
  SuspensionRequest,
  SuspensionRequestSchema,
} from '@/store/features/leasing/suspension-schemas';
import {
  createSuspension,
  editSuspension,
  getSuspensionById,
  resetSuspension,
} from '@/store/features/leasing/suspensionsSlice';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { useAppSelector } from '@/store/hooks';
import { Lock, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/leasing-management/suspensions';

const emptyForm: SuspensionRequest = {
  noBuilding: 0,
  noContratLocation: 0,
  motifSuspension: '',
  statutValidation: 'Nouveau',
  dateSuspension: '',
  dateArretSuspension: '',
  inactif: false,
};

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.suspensions.item);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: baux } = useAppSelector((state) => state.baux);

  const [formData, setFormData] = useState<SuspensionRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getSuspensionById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (formData.noBuilding) {
      dispatch(getAllBaux({ pageNumber: 1, pageSize: 100, filters: { NoBuilding: [formData.noBuilding] } }));
    }
  }, [formData.noBuilding, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noBuilding: item.noBuilding,
        noContratLocation: item.noContratLocation,
        motifSuspension: item.motifSuspension ?? '',
        statutValidation: item.statutValidation,
        dateSuspension: item.dateSuspension ? item.dateSuspension.substring(0, 10) : '',
        dateArretSuspension: item.dateArretSuspension ? item.dateArretSuspension.substring(0, 10) : '',
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof SuspensionRequest>(field: T, value: SuspensionRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: SuspensionRequest) => {
    try {
      SuspensionRequestSchema.parse(data);
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
      await dispatch(editSuspension({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetSuspension());
    } else {
      await dispatch(createSuspension(formData)).unwrap();
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
                ? `Détails suspension — ${item?.numContratLocations ?? ''}`
                : item
                ? `Modifier suspension — ${item.numContratLocations ?? ''}`
                : 'Ajouter une suspension'
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
        {Object.keys(errors).length > 0 && (
          <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
            {Object.values(errors).join(' ')}
          </div>
        )}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <Section icon={Lock} title='Informations'>
            <FormGroupTitle>Contrat concerné</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 md:col-span-6'>
              <Label htmlFor='noBuilding' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Actif
              </Label>
              <Select
                value={formData.noBuilding ? formData.noBuilding.toString() : ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, noBuilding: Number(value), noContratLocation: 0 }))
                }
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

            <div className='min-w-0 space-y-1.5 col-span-12 md:col-span-6'>
              <Label htmlFor='noContratLocation' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>N° Contrat
              </Label>
              <Select
                value={formData.noContratLocation ? formData.noContratLocation.toString() : ''}
                onValueChange={(value) => handleChange('noContratLocation', Number(value))}
                disabled={changeToDetails || !formData.noBuilding}
              >
                <SelectTrigger id='noContratLocation' className={errors.noContratLocation ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez un contrat...' />
                </SelectTrigger>
                <SelectContent>
                  {baux.map((b) => (
                    <SelectItem key={b.numero} value={b.numero.toString()}>
                      {b.numContratLocations || `Bail #${b.numero}`} — {b.nomLocataire || ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.noContratLocation && <p className='text-red-600 text-sm'>{errors.noContratLocation}</p>}
            </div>

            <FormGroupTitle>Suspension</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='statutValidation' className='text-sm font-medium'>
                Statut
              </Label>
              <Select
                value={formData.statutValidation}
                onValueChange={(value) => handleChange('statutValidation', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='statutValidation'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS_SUSPENSION.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateSuspension' className='text-sm font-medium'>
                Date suspension
              </Label>
              <Input
                id='dateSuspension'
                type='date'
                value={formData.dateSuspension ?? ''}
                onChange={(e) => handleChange('dateSuspension', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateArretSuspension' className='text-sm font-medium'>
                Date Reprise
              </Label>
              <Input
                id='dateArretSuspension'
                type='date'
                value={formData.dateArretSuspension ?? ''}
                onChange={(e) => handleChange('dateArretSuspension', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12'>
              <Label htmlFor='motifSuspension' className='text-sm font-medium'>
                Motif suspension
              </Label>
              <Input
                id='motifSuspension'
                value={formData.motifSuspension ?? ''}
                onChange={(e) => handleChange('motifSuspension', e.target.value)}
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
