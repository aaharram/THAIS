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
import { AppDispatch, RootState } from '@/store';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import {
  SyndicReunionRequest,
  SyndicReunionRequestSchema,
  TYPES_REUNION_SYNDIC,
} from '@/store/features/property-management/syndic-reunion-schemas';
import {
  createSyndicReunion,
  editSyndicReunion,
  getSyndicReunionById,
  resetSyndicReunion,
} from '@/store/features/property-management/syndicReunionsSlice';
import { useAppSelector } from '@/store/hooks';
import { Users, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const emptyForm: SyndicReunionRequest = {
  noBuilding: 0,
  type: '',
  dateReunion: '',
  reglee: false,
  dateReglement: '',
  noVille: null,
  nombreQuotePart: null,
  quotePartAppelFonds: null,
  appelFondsAnnuel: null,
  pjConvocation: '',
  pjPV: '',
  pjAppelFonds: '',
  notes: '',
  inactif: false,
};

const Form = ({ details }: { details?: boolean }) => {
  const { id, buildingId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.syndicReunions.item);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: villes } = useAppSelector((state) => state.cfgVilles);

  const backPath = `/property-management/syndics/${buildingId}/reunions`;

  const [formData, setFormData] = useState<SyndicReunionRequest>({
    ...emptyForm,
    noBuilding: buildingId ? Number(buildingId) : 0,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 100 }));
    dispatch(lookupModules.cfgVilles.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getSyndicReunionById(Number(id)));
    }
  }, [id, dispatch]);

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noBuilding: item.noBuilding,
        type: item.type ?? '',
        dateReunion: item.dateReunion ? item.dateReunion.substring(0, 10) : '',
        reglee: item.reglee,
        dateReglement: item.dateReglement ? item.dateReglement.substring(0, 10) : '',
        noVille: item.noVille ?? null,
        nombreQuotePart: item.nombreQuotePart ?? null,
        quotePartAppelFonds: item.quotePartAppelFonds ?? null,
        appelFondsAnnuel: item.appelFondsAnnuel ?? null,
        pjConvocation: item.pjConvocation ?? '',
        pjPV: item.pjPV ?? '',
        pjAppelFonds: item.pjAppelFonds ?? '',
        notes: item.notes ?? '',
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof SyndicReunionRequest>(field: T, value: SyndicReunionRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: SyndicReunionRequest) => {
    try {
      SyndicReunionRequestSchema.parse(data);
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
      await dispatch(editSyndicReunion({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetSyndicReunion());
    } else {
      await dispatch(createSyndicReunion(formData)).unwrap();
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
                ? `Détails réunion — ${item?.nomBuilding ?? ''}`
                : item
                ? `Modifier réunion — ${item.nomBuilding ?? ''}`
                : 'Ajouter une réunion de syndic'
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
            <FormGroupTitle>Réunion</FormGroupTitle>

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
              <Label htmlFor='type' className='text-sm font-medium'>
                Type
              </Label>
              <Select
                value={formData.type || ''}
                onValueChange={(value) => handleChange('type', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='type'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_REUNION_SYNDIC.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='noVille' className='text-sm font-medium'>
                Lieu
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
                  <SelectItem value='0'>Aucun</SelectItem>
                  {villes.map((v) => (
                    <SelectItem key={v.numero} value={v.numero.toString()}>
                      {v.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateReunion' className='text-sm font-medium'>
                Date
              </Label>
              <Input
                id='dateReunion'
                type='date'
                value={formData.dateReunion ?? ''}
                onChange={(e) => handleChange('dateReunion', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <FormGroupTitle>Pièces jointes</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='pjConvocation' className='text-sm font-medium'>
                Pj Convocation
              </Label>
              <Input
                id='pjConvocation'
                value={formData.pjConvocation ?? ''}
                onChange={(e) => handleChange('pjConvocation', e.target.value)}
                disabled={changeToDetails}
                placeholder='Nom du fichier'
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='pjPV' className='text-sm font-medium'>
                Pj PV
              </Label>
              <Input
                id='pjPV'
                value={formData.pjPV ?? ''}
                onChange={(e) => handleChange('pjPV', e.target.value)}
                disabled={changeToDetails}
                placeholder='Nom du fichier'
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='pjAppelFonds' className='text-sm font-medium'>
                Pj Appel de fonds
              </Label>
              <Input
                id='pjAppelFonds'
                value={formData.pjAppelFonds ?? ''}
                onChange={(e) => handleChange('pjAppelFonds', e.target.value)}
                disabled={changeToDetails}
                placeholder='Nom du fichier'
              />
            </div>

            <FormGroupTitle>Appel de fonds</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='appelFondsAnnuel' className='text-sm font-medium'>
                Appel de fonds annuel
              </Label>
              <Input
                id='appelFondsAnnuel'
                type='number'
                step='0.01'
                value={formData.appelFondsAnnuel ?? ''}
                onChange={(e) => handleChange('appelFondsAnnuel', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='quotePartAppelFonds' className='text-sm font-medium'>
                Quote part Appel de fonds
              </Label>
              <Input
                id='quotePartAppelFonds'
                type='number'
                step='0.01'
                value={formData.quotePartAppelFonds ?? ''}
                onChange={(e) => handleChange('quotePartAppelFonds', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='nombreQuotePart' className='text-sm font-medium'>
                Nombre de Quote part
              </Label>
              <Input
                id='nombreQuotePart'
                type='number'
                value={formData.nombreQuotePart ?? ''}
                onChange={(e) => handleChange('nombreQuotePart', numOrNull(e.target.value) as number | null)}
                disabled={changeToDetails}
              />
            </div>

            <div className='col-span-12 sm:col-span-6 md:col-span-4'>
            <div className='flex items-center gap-2 pt-6'>
              <Checkbox
                id='reglee'
                checked={formData.reglee}
                onCheckedChange={(c) => handleChange('reglee', c === true)}
                disabled={changeToDetails}
              />
              <Label htmlFor='reglee'>Réglé</Label>
            </div>
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateReglement' className='text-sm font-medium'>
                Date règlement
              </Label>
              <Input
                id='dateReglement'
                type='date'
                value={formData.dateReglement ?? ''}
                onChange={(e) => handleChange('dateReglement', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12'>
              <Label htmlFor='notes' className='text-sm font-medium'>
                Note
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
