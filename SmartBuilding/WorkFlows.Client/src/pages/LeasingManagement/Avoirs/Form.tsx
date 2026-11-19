import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/title';
import { AppDispatch } from '@/store';
import { AvoirRequest, AvoirRequestSchema } from '@/store/features/leasing/avoir-schemas';
import { creerAvoir } from '@/store/features/leasing/avoirsSlice';
import { getAllFactures } from '@/store/features/leasing/facturesSlice';
import { useAppSelector } from '@/store/hooks';
import { Receipt, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { z } from 'zod';

const backPath = '/leasing-management/avoirs';

const emptyForm: AvoirRequest = {
  noFacture: 0,
  dateAvoir: new Date().toISOString().substring(0, 10),
  montant: 0,
  notes: '',
};

const Form = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { allItems: factures } = useAppSelector((state) => state.factures);
  const facturesImpayees = useMemo(
    () => factures.filter((f) => f.etat === 'Impayée' || f.etat === 'Partiellement payée'),
    [factures],
  );

  useEffect(() => {
    dispatch(getAllFactures({ pageNumber: 1, pageSize: 100 }));
  }, [dispatch]);

  const [formData, setFormData] = useState<AvoirRequest>({ ...emptyForm, addUser: userId });

  const factureSelectionnee = factures.find((f) => f.numero === formData.noFacture);
  const soldeApres = factureSelectionnee ? Math.max(0, factureSelectionnee.montant - (formData.montant || 0)) : null;

  const handleChange = <T extends keyof AvoirRequest>(field: T, value: AvoirRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: AvoirRequest) => {
    try {
      AvoirRequestSchema.parse(data);
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

    await dispatch(creerAvoir(formData)).unwrap();
    navigate(backPath);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>
          <Title icon={Receipt} title='Émettre un avoir' description='Note de crédit sur une facture impayée' />
        </CardTitle>
      </CardHeader>
      <div className='px-6'>
        <hr />
      </div>
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='noFacture' className='text-sm font-medium'>
              <span className='text-red-500'>* </span>Facture impayée
            </Label>
            <Select
              value={formData.noFacture ? formData.noFacture.toString() : ''}
              onValueChange={(value) => handleChange('noFacture', Number(value))}
            >
              <SelectTrigger id='noFacture' className={errors.noFacture ? 'border-red-300' : ''}>
                <SelectValue placeholder='Sélectionnez une facture...' />
              </SelectTrigger>
              <SelectContent>
                {facturesImpayees.map((f) => (
                  <SelectItem key={f.numero} value={f.numero.toString()}>
                    {f.numContratLocations || `#${f.numero}`} — {f.nomLocataire} ({f.nomBuilding}) —{' '}
                    {f.montant.toLocaleString('fr-FR')} MAD dus
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.noFacture && <p className='text-red-600 text-sm'>{errors.noFacture}</p>}
          </div>

          {factureSelectionnee && (
            <div className='rounded-lg border bg-blue-50/50 p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm'>
              <div>
                <div className='text-muted-foreground'>Montant dû actuel</div>
                <div className='font-semibold'>{factureSelectionnee.montant.toLocaleString('fr-FR')} MAD</div>
              </div>
              <div>
                <div className='text-muted-foreground'>Solde après avoir</div>
                <div className='font-semibold text-blue-700'>
                  {soldeApres !== null ? soldeApres.toLocaleString('fr-FR') : '-'} MAD
                </div>
              </div>
              <div>
                <div className='text-muted-foreground'>Facture soldée ?</div>
                <div className='font-semibold'>{soldeApres !== null && soldeApres <= 0.01 ? 'Oui — Payée' : 'Non'}</div>
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='dateAvoir' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Date de l'avoir
              </Label>
              <Input
                id='dateAvoir'
                type='date'
                value={formData.dateAvoir}
                onChange={(e) => handleChange('dateAvoir', e.target.value)}
              />
              {errors.dateAvoir && <p className='text-red-600 text-sm'>{errors.dateAvoir}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='montant' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Montant de l'avoir
              </Label>
              <Input
                id='montant'
                type='number'
                step='0.01'
                value={formData.montant || ''}
                onChange={(e) => handleChange('montant', e.target.value === '' ? 0 : Number(e.target.value))}
              />
              {errors.montant && <p className='text-red-600 text-sm'>{errors.montant}</p>}
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
        <Button onClick={handleSubmit}><Save />Émettre l'avoir</Button>
      </CardFooter>
    </Card>
  );
};

export default Form;
