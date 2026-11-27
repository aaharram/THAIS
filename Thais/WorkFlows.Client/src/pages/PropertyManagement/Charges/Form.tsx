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
import { getAllTypologiesCharge } from '@/store/features/configuration/typologiesChargeSlice';
import { getAllPrestataires } from '@/store/features/property-management/prestatairesSlice';
import { ChargeRequest, ChargeRequestSchema } from '@/store/features/property-management/charge-schemas';
import {
  createCharge,
  editCharge,
  getChargeById,
  resetCharge,
} from '@/store/features/property-management/chargesSlice';
import { useAppSelector } from '@/store/hooks';
import { Banknote, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/property-management/charges';

const emptyForm: ChargeRequest = {
  noBuilding: 0,
  noTypologieCharge: 0,
  noPrestataire: null,
  annee: new Date().getFullYear(),
  montant: null,
  realisation: null,
  dateDecaissement: '',
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

  const item = useAppSelector((state: RootState) => state.chargesPm.item);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: typologies } = useAppSelector((state) => state.cfgTypologiesCharge);
  const { allItems: prestataires } = useAppSelector((state) => state.prestataires);

  const [formData, setFormData] = useState<ChargeRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 1000 }));
    dispatch(getAllTypologiesCharge({ pageNumber: 1, pageSize: 1000 }));
    dispatch(getAllPrestataires({ pageNumber: 1, pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getChargeById(Number(id)));
    }
  }, [id, dispatch]);

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noBuilding: item.noBuilding,
        noTypologieCharge: item.noTypologieCharge,
        noPrestataire: item.noPrestataire ?? null,
        annee: item.annee,
        montant: item.montant ?? null,
        realisation: item.realisation ?? null,
        dateDecaissement: item.dateDecaissement ? item.dateDecaissement.substring(0, 10) : '',
        notes: item.notes ?? '',
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof ChargeRequest>(field: T, value: ChargeRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: ChargeRequest) => {
    try {
      ChargeRequestSchema.parse(data);
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
      await dispatch(editCharge({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetCharge());
    } else {
      await dispatch(createCharge(formData)).unwrap();
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
                ? `Détails charge — ${item?.codeCharge ?? ''}`
                : item
                ? `Modifier charge — ${item.codeCharge ?? ''}`
                : 'Ajouter une charge'
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
          <Section icon={Banknote} title='Informations'>
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
              <Label htmlFor='noTypologieCharge' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Typologie
              </Label>
              <Select
                value={formData.noTypologieCharge ? formData.noTypologieCharge.toString() : ''}
                onValueChange={(value) => handleChange('noTypologieCharge', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noTypologieCharge' className={errors.noTypologieCharge ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {typologies.map((t) => (
                    <SelectItem key={t.numero} value={t.numero.toString()}>
                      {t.typologie}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.noTypologieCharge && <p className='text-red-600 text-sm'>{errors.noTypologieCharge}</p>}
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='noPrestataire' className='text-sm font-medium'>
                Prestataire
              </Label>
              <Select
                value={formData.noPrestataire?.toString() || '0'}
                onValueChange={(value) => handleChange('noPrestataire', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noPrestataire'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucun</SelectItem>
                  {prestataires.map((p) => (
                    <SelectItem key={p.numero} value={p.numero.toString()}>
                      {p.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormGroupTitle>Budget</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='annee' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Année
              </Label>
              <Input
                id='annee'
                type='number'
                value={formData.annee ?? ''}
                onChange={(e) => handleChange('annee', Number(e.target.value))}
                disabled={changeToDetails}
                className={errors.annee ? 'border-red-300' : ''}
              />
              {errors.annee && <p className='text-red-600 text-sm'>{errors.annee}</p>}
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='montant' className='text-sm font-medium'>
                Montant prévu
              </Label>
              <Input
                id='montant'
                type='number'
                step='0.01'
                value={formData.montant ?? ''}
                onChange={(e) => handleChange('montant', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='realisation' className='text-sm font-medium'>
                Réalisation
              </Label>
              <Input
                id='realisation'
                type='number'
                step='0.01'
                value={formData.realisation ?? ''}
                onChange={(e) => handleChange('realisation', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateDecaissement' className='text-sm font-medium'>
                Date de décaissement
              </Label>
              <Input
                id='dateDecaissement'
                type='date'
                value={formData.dateDecaissement ?? ''}
                onChange={(e) => handleChange('dateDecaissement', e.target.value)}
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
