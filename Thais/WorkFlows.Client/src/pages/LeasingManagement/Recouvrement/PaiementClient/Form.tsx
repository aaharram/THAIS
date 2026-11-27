import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/title';
import { AppDispatch } from '@/store';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { getBailById } from '@/store/features/leasing/bauxSlice';
import { MODES_PAIEMENT, PaiementRequest, PaiementRequestSchema } from '@/store/features/leasing/paiement-schemas';
import { creerPaiement } from '@/store/features/leasing/paiementsSlice';
import { useAppSelector } from '@/store/hooks';
import { Wallet, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

const backPath = '/leasing-management/recouvrement/paiement-client';

const Form = () => {
  const [searchParams] = useSearchParams();
  const noLocation = Number(searchParams.get('noLocation')) || 0;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const bail = useAppSelector((state) => state.baux.item);
  const { allItems: encaisseurs } = useAppSelector((state) => state.cfgEncaisseurs);

  useEffect(() => {
    if (noLocation) {
      dispatch(getBailById(noLocation));
    }
    dispatch(lookupModules.cfgEncaisseurs.getAll({ pageSize: 1000 }));
  }, [noLocation, dispatch]);

  const [formData, setFormData] = useState<PaiementRequest>({
    addUser: userId,
    noLocation,
    noEncaisseur: null,
    montant: 0,
    modePaiement: 'Espèce',
    datePaiement: new Date().toISOString().substring(0, 10),
    reference: '',
    notes: '',
  });

  useEffect(() => {
    if (bail?.noEncaisseur) {
      setFormData((prev) => ({ ...prev, noEncaisseur: bail.noEncaisseur ?? null }));
    }
  }, [bail]);

  const handleChange = <T extends keyof PaiementRequest>(field: T, value: PaiementRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: PaiementRequest) => {
    try {
      PaiementRequestSchema.parse(data);
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

    await dispatch(creerPaiement(formData)).unwrap();
    navigate(backPath);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>
          <Title
            icon={Wallet}
            title={`Paiement direct — ${bail?.nomLocataire ?? ''}`}
            description={
              bail
                ? `${bail.nomBuilding ?? ''} · ${bail.nomLocal ?? ''} — Loyer impayé : ${(bail.montant ?? 0).toLocaleString('fr-FR')} MAD`
                : undefined
            }
          />
        </CardTitle>
      </CardHeader>
      <div className='px-6'>
        <hr />
      </div>
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 [&_input:not([type=checkbox])]:w-full [&_[role=combobox]]:w-full [&_textarea]:w-full'>
            <div className='space-y-2'>
              <Label htmlFor='montant' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Montant (MAD)
              </Label>
              <Input
                id='montant'
                type='number'
                step='0.01'
                min='0'
                value={formData.montant || ''}
                onChange={(e) => handleChange('montant', Number(e.target.value))}
              />
              {errors.montant && <p className='text-red-600 text-sm'>{errors.montant}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='modePaiement' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Mode de paiement
              </Label>
              <Select
                value={formData.modePaiement}
                onValueChange={(value) => handleChange('modePaiement', value)}
              >
                <SelectTrigger id='modePaiement'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODES_PAIEMENT.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.modePaiement && <p className='text-red-600 text-sm'>{errors.modePaiement}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='datePaiement' className='text-sm font-medium'>
                Date de paiement
              </Label>
              <Input
                id='datePaiement'
                type='date'
                value={formData.datePaiement ?? ''}
                onChange={(e) => handleChange('datePaiement', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noEncaisseur' className='text-sm font-medium'>
                Encaisseur
              </Label>
              <Select
                value={formData.noEncaisseur ? String(formData.noEncaisseur) : '0'}
                onValueChange={(value) => handleChange('noEncaisseur', value === '0' ? null : Number(value))}
              >
                <SelectTrigger id='noEncaisseur'>
                  <SelectValue placeholder='Choix Encaisseur' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Choix Encaisseur</SelectItem>
                  {encaisseurs.map((e) => (
                    <SelectItem key={e.numero} value={String(e.numero)}>
                      {e.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.modePaiement !== 'Espèce' && (
              <div className='space-y-2'>
                <Label htmlFor='reference' className='text-sm font-medium'>
                  Référence (n° chèque/effet)
                </Label>
                <Input
                  id='reference'
                  value={formData.reference ?? ''}
                  onChange={(e) => handleChange('reference', e.target.value)}
                />
              </div>
            )}

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
        <Button variant='outline'
          className='border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary' onClick={() => navigate(backPath)}>
          <ArrowLeft />
          Retour
        </Button>
        <Button onClick={handleSubmit}><Save />Enregistrer le paiement</Button>
      </CardFooter>
    </Card>
  );
};

export default Form;
