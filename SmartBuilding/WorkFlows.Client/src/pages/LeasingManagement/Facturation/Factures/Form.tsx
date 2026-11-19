import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/title';
import { AppDispatch } from '@/store';
import { getAllBaux } from '@/store/features/leasing/bauxSlice';
import { FactureRequest, FactureRequestSchema, TYPES_FACTURE } from '@/store/features/leasing/facture-schemas';
import { genererFacture } from '@/store/features/leasing/facturesSlice';
import { useAppSelector } from '@/store/hooks';
import { Receipt, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { z } from 'zod';

const backPath = '/leasing-management/facturation/factures';

const emptyForm: FactureRequest = {
  noLocation: 0,
  periode: new Date().toISOString().substring(0, 10),
  dateEcheance: '',
  typeFacture: 'LoyerM',
  loyerNet: null,
  charges: null,
  tva: null,
  taxe: null,
  autres: null,
  notes: '',
};

const Form = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { allItems: baux } = useAppSelector((state) => state.baux);

  useEffect(() => {
    dispatch(getAllBaux({ pageNumber: 1, pageSize: 100 }));
  }, [dispatch]);

  const [formData, setFormData] = useState<FactureRequest>({ ...emptyForm, addUser: userId });

  const bailSelectionne = baux.find((b) => b.numero === formData.noLocation);

  useEffect(() => {
    if (bailSelectionne) {
      setFormData((prev) => ({
        ...prev,
        loyerNet: bailSelectionne.loyerNet ?? null,
        charges: bailSelectionne.charges ?? null,
        tva: bailSelectionne.tva ?? null,
        taxe: bailSelectionne.taxe ?? null,
        autres: bailSelectionne.autres ?? null,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.noLocation]);

  const montantEstime = useMemo(
    () =>
      (formData.loyerNet ?? 0) + (formData.charges ?? 0) + (formData.tva ?? 0) + (formData.taxe ?? 0) +
      (formData.autres ?? 0),
    [formData.loyerNet, formData.charges, formData.tva, formData.taxe, formData.autres],
  );

  const handleChange = <T extends keyof FactureRequest>(field: T, value: FactureRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  const validate = (data: FactureRequest) => {
    try {
      FactureRequestSchema.parse(data);
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

    await dispatch(genererFacture(formData)).unwrap();
    navigate(backPath);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>
          <Title icon={Receipt} title='Générer une facture' description='Avis d’échéance / Facture de loyer' />
        </CardTitle>
      </CardHeader>
      <div className='px-6'>
        <hr />
      </div>
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='noLocation' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Bail
              </Label>
              <Select
                value={formData.noLocation ? formData.noLocation.toString() : ''}
                onValueChange={(value) => handleChange('noLocation', Number(value))}
              >
                <SelectTrigger id='noLocation' className={errors.noLocation ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez un bail...' />
                </SelectTrigger>
                <SelectContent>
                  {baux.map((b) => (
                    <SelectItem key={b.numero} value={b.numero.toString()}>
                      {b.numContratLocations || `#${b.numero}`} — {b.nomLocataire} ({b.nomBuilding})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.noLocation && <p className='text-red-600 text-sm'>{errors.noLocation}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='periode' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Période facturée
              </Label>
              <Input
                id='periode'
                type='date'
                value={formData.periode}
                onChange={(e) => handleChange('periode', e.target.value)}
              />
              {errors.periode && <p className='text-red-600 text-sm'>{errors.periode}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dateEcheance' className='text-sm font-medium'>
                Date d'échéance
              </Label>
              <Input
                id='dateEcheance'
                type='date'
                placeholder='= période si vide'
                value={formData.dateEcheance ?? ''}
                onChange={(e) => handleChange('dateEcheance', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='typeFacture' className='text-sm font-medium'>
                Type
              </Label>
              <Select
                value={formData.typeFacture ?? 'LoyerM'}
                onValueChange={(value) => handleChange('typeFacture', value)}
              >
                <SelectTrigger id='typeFacture'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_FACTURE.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='loyerNet' className='text-sm font-medium'>
                Loyer net
              </Label>
              <Input
                id='loyerNet'
                type='number'
                step='0.01'
                value={formData.loyerNet ?? ''}
                onChange={(e) => handleChange('loyerNet', numOrNull(e.target.value))}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='charges' className='text-sm font-medium'>
                Charges
              </Label>
              <Input
                id='charges'
                type='number'
                step='0.01'
                value={formData.charges ?? ''}
                onChange={(e) => handleChange('charges', numOrNull(e.target.value))}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='tva' className='text-sm font-medium'>
                TVA
              </Label>
              <Input
                id='tva'
                type='number'
                step='0.01'
                value={formData.tva ?? ''}
                onChange={(e) => handleChange('tva', numOrNull(e.target.value))}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='taxe' className='text-sm font-medium'>
                Taxe
              </Label>
              <Input
                id='taxe'
                type='number'
                step='0.01'
                value={formData.taxe ?? ''}
                onChange={(e) => handleChange('taxe', numOrNull(e.target.value))}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='autres' className='text-sm font-medium'>
                Autres
              </Label>
              <Input
                id='autres'
                type='number'
                step='0.01'
                value={formData.autres ?? ''}
                onChange={(e) => handleChange('autres', numOrNull(e.target.value))}
              />
            </div>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Montant total</Label>
              <Input value={montantEstime.toLocaleString('fr-FR')} readOnly disabled className='bg-gray-50 font-semibold' />
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
              />
            </div>
          </div>
        </form>
      </CardContent>
      <div className='px-6'>
        <hr />
      </div>
      <CardFooter className='flex justify-end gap-2 mt-6'>
        <Button variant='secondary' onClick={() => navigate(backPath)}>
          <ArrowLeft />
          Retour
        </Button>
        <Button onClick={handleSubmit}><Save />Générer la facture</Button>
      </CardFooter>
    </Card>
  );
};

export default Form;
