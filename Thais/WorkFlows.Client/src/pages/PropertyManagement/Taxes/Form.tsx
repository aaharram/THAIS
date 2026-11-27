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
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { getAllLocaux } from '@/store/features/patrimoine/locauxSlice';
import { getAllLocataires } from '@/store/features/leasing/locatairesSlice';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { TaxeRequest, TaxeRequestSchema } from '@/store/features/property-management/taxe-schemas';
import { createTaxe, editTaxe, getTaxeById, resetTaxe } from '@/store/features/property-management/taxesSlice';
import { useAppSelector } from '@/store/hooks';
import { Landmark, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/property-management/taxes';

const emptyForm: TaxeRequest = {
  noBuilding: 0,
  noLocal: null,
  noLocataire: null,
  noType: 0,
  idFiscal: '',
  noArticle: '',
  montantTaxe: null,
  annee: new Date().getFullYear(),
  paye: false,
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

  const item = useAppSelector((state: RootState) => state.taxesPm.item);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: locaux } = useAppSelector((state) => state.locaux);
  const { allItems: locataires } = useAppSelector((state) => state.locataires);
  const { allItems: typesTaxe } = useAppSelector((state) => state.cfgTypesTaxe);

  const [formData, setFormData] = useState<TaxeRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 1000 }));
    dispatch(getAllLocaux({ pageNumber: 1, pageSize: 1000 }));
    dispatch(getAllLocataires({ pageNumber: 1, pageSize: 1000 }));
    dispatch(lookupModules.cfgTypesTaxe.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getTaxeById(Number(id)));
    }
  }, [id, dispatch]);

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noBuilding: item.noBuilding,
        noLocal: item.noLocal ?? null,
        noLocataire: item.noLocataire ?? null,
        noType: item.noType,
        idFiscal: item.idFiscal ?? '',
        noArticle: item.noArticle ?? '',
        montantTaxe: item.montantTaxe ?? null,
        annee: item.annee,
        paye: item.paye,
        notes: item.notes ?? '',
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof TaxeRequest>(field: T, value: TaxeRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const localsForBuilding = locaux.filter((l) => l.noBuilding === formData.noBuilding);

  const validate = (data: TaxeRequest) => {
    try {
      TaxeRequestSchema.parse(data);
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
      await dispatch(editTaxe({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetTaxe());
    } else {
      await dispatch(createTaxe(formData)).unwrap();
    }

    navigate(backPath);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle className='flex justify-between'>
          <Title
            title={changeToDetails ? 'Détails taxe' : item ? 'Modifier taxe' : 'Ajouter une taxe'}
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
          <Section icon={Landmark} title='Informations'>
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
                Locataire
              </Label>
              <Select
                value={formData.noLocataire?.toString() || '0'}
                onValueChange={(value) => handleChange('noLocataire', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noLocataire'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucun</SelectItem>
                  {locataires.map((l) => (
                    <SelectItem key={l.numero} value={l.numero.toString()}>
                      {l.nomAffiche}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormGroupTitle>Taxe</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='noType' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Type de taxe
              </Label>
              <Select
                value={formData.noType ? formData.noType.toString() : ''}
                onValueChange={(value) => handleChange('noType', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noType' className={errors.noType ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {typesTaxe.map((t) => (
                    <SelectItem key={t.numero} value={t.numero.toString()}>
                      {t.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.noType && <p className='text-red-600 text-sm'>{errors.noType}</p>}
            </div>

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
              <Label htmlFor='noArticle' className='text-sm font-medium'>
                N° Article
              </Label>
              <Input
                id='noArticle'
                value={formData.noArticle ?? ''}
                onChange={(e) => handleChange('noArticle', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='idFiscal' className='text-sm font-medium'>
                ID Fiscal
              </Label>
              <Input
                id='idFiscal'
                value={formData.idFiscal ?? ''}
                onChange={(e) => handleChange('idFiscal', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <FormGroupTitle>Paiement</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='montantTaxe' className='text-sm font-medium'>
                Montant
              </Label>
              <Input
                id='montantTaxe'
                type='number'
                step='0.01'
                value={formData.montantTaxe ?? ''}
                onChange={(e) => handleChange('montantTaxe', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='col-span-12 sm:col-span-6 md:col-span-4'>
            <div className='flex items-center gap-2 pt-6'>
              <Checkbox
                id='paye'
                checked={formData.paye ?? false}
                onCheckedChange={(checked) => handleChange('paye', checked === true)}
                disabled={changeToDetails}
              />
              <Label htmlFor='paye'>Payé</Label>
            </div>
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
