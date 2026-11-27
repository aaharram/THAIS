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
import { getAllBonsDeCommande } from '@/store/features/property-management/bonsDeCommandeSlice';
import {
  PrestationAchatRequest,
  PrestationAchatRequestSchema,
} from '@/store/features/property-management/prestation-achat-schemas';
import {
  createPrestationAchat,
  editPrestationAchat,
  getPrestationAchatById,
  resetPrestationAchat,
} from '@/store/features/property-management/prestationsAchatSlice';
import { useAppSelector } from '@/store/hooks';
import { ClipboardList, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/property-management/liste-prestations';

const emptyForm: PrestationAchatRequest = {
  noBonCommande: 0,
  noBuilding: 0,
  noTypologieCharge: 0,
  prixUnitaireHT: 0,
  quantite: 1,
  tauxTVA: null,
  notes: '',
};

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.prestationsAchatPm.item);
  const { allItems: bonsDeCommande } = useAppSelector((state) => state.bonsDeCommandePm);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: typologies } = useAppSelector((state) => state.cfgTypologiesCharge);

  const [formData, setFormData] = useState<PrestationAchatRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBonsDeCommande({ pageNumber: 1, pageSize: 1000 }));
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 1000 }));
    dispatch(getAllTypologiesCharge({ pageNumber: 1, pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getPrestationAchatById(Number(id)));
    }
  }, [id, dispatch]);

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noBonCommande: item.noBonCommande,
        noBuilding: item.noBuilding,
        noTypologieCharge: item.noTypologieCharge,
        prixUnitaireHT: item.prixUnitaireHT,
        quantite: item.quantite,
        tauxTVA: item.tauxTVA ?? null,
        notes: item.notes ?? '',
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof PrestationAchatRequest>(field: T, value: PrestationAchatRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: PrestationAchatRequest) => {
    try {
      PrestationAchatRequestSchema.parse(data);
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
      await dispatch(editPrestationAchat({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetPrestationAchat());
    } else {
      await dispatch(createPrestationAchat(formData)).unwrap();
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
                ? 'Détails prestation'
                : item
                ? 'Modifier prestation'
                : 'Ajouter une prestation'
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
          <Section icon={ClipboardList} title='Informations'>
            <FormGroupTitle>Rattachement</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='noBonCommande' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Bon de commande
              </Label>
              <Select
                value={formData.noBonCommande ? formData.noBonCommande.toString() : ''}
                onValueChange={(value) => handleChange('noBonCommande', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noBonCommande' className={errors.noBonCommande ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {bonsDeCommande.map((b) => (
                    <SelectItem key={b.numero} value={b.numero.toString()}>
                      {b.numeroBonCommande}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.noBonCommande && <p className='text-red-600 text-sm'>{errors.noBonCommande}</p>}
            </div>

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

            <FormGroupTitle>Prix</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='prixUnitaireHT' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Prix unitaire HT
              </Label>
              <Input
                id='prixUnitaireHT'
                type='number'
                step='0.01'
                value={formData.prixUnitaireHT ?? ''}
                onChange={(e) => handleChange('prixUnitaireHT', Number(e.target.value))}
                disabled={changeToDetails}
                className={errors.prixUnitaireHT ? 'border-red-300' : ''}
              />
              {errors.prixUnitaireHT && <p className='text-red-600 text-sm'>{errors.prixUnitaireHT}</p>}
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='quantite' className='text-sm font-medium'>
                Quantité
              </Label>
              <Input
                id='quantite'
                type='number'
                step='0.01'
                value={formData.quantite ?? ''}
                onChange={(e) => handleChange('quantite', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='tauxTVA' className='text-sm font-medium'>
                Taux TVA (%)
              </Label>
              <Input
                id='tauxTVA'
                type='number'
                step='0.01'
                value={formData.tauxTVA ?? ''}
                onChange={(e) => handleChange('tauxTVA', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            {item && (
              <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
                <Label className='text-sm font-medium'>Montant TTC (calculé)</Label>
                <Input value={item.montantTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} disabled />
              </div>
            )}

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
