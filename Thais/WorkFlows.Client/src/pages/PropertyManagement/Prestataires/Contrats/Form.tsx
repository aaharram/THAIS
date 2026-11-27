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
import {
  PrestataireContratRequest,
  PrestataireContratRequestSchema,
} from '@/store/features/property-management/prestataire-contrat-schemas';
import {
  createPrestataireContrat,
  editPrestataireContrat,
  getPrestataireContratById,
  resetPrestataireContrat,
} from '@/store/features/property-management/prestataireContratsSlice';
import { getAllPrestataires } from '@/store/features/property-management/prestatairesSlice';
import { useAppSelector } from '@/store/hooks';
import { FileText, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/property-management/prestataires/contrats';

const emptyForm: PrestataireContratRequest = {
  noPrestataire: 0,
  objet: '',
  dateContrat: '',
  dateDebut: '',
  dateFin: '',
  montant: null,
  pieceJointe: '',
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

  const item = useAppSelector((state: RootState) => state.prestataireContrats.item);
  const { allItems: prestataires } = useAppSelector((state) => state.prestataires);

  const [formData, setFormData] = useState<PrestataireContratRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllPrestataires({ pageNumber: 1, pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getPrestataireContratById(Number(id)));
    }
  }, [id, dispatch]);

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noPrestataire: item.noPrestataire,
        objet: item.objet ?? '',
        dateContrat: item.dateContrat ? item.dateContrat.substring(0, 10) : '',
        dateDebut: item.dateDebut ? item.dateDebut.substring(0, 10) : '',
        dateFin: item.dateFin ? item.dateFin.substring(0, 10) : '',
        montant: item.montant ?? null,
        pieceJointe: item.pieceJointe ?? '',
        notes: item.notes ?? '',
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof PrestataireContratRequest>(
    field: T,
    value: PrestataireContratRequest[T],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: PrestataireContratRequest) => {
    try {
      PrestataireContratRequestSchema.parse(data);
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
      await dispatch(editPrestataireContrat({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetPrestataireContrat());
    } else {
      await dispatch(createPrestataireContrat(formData)).unwrap();
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
                ? `Détails contrat — ${item?.numeroContrat ?? ''}`
                : item
                ? `Modifier contrat — ${item.numeroContrat ?? ''}`
                : 'Ajouter un contrat'
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
          <Section icon={FileText} title='Informations'>
            <FormGroupTitle>Contrat</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='noPrestataire' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Prestataire
              </Label>
              <Select
                value={formData.noPrestataire ? formData.noPrestataire.toString() : ''}
                onValueChange={(value) => handleChange('noPrestataire', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noPrestataire' className={errors.noPrestataire ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez un prestataire...' />
                </SelectTrigger>
                <SelectContent>
                  {prestataires.map((p) => (
                    <SelectItem key={p.numero} value={p.numero.toString()}>
                      {p.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.noPrestataire && <p className='text-red-600 text-sm'>{errors.noPrestataire}</p>}
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 md:col-span-8'>
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

            <FormGroupTitle>Dates et montant</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateContrat' className='text-sm font-medium'>
                Date contrat
              </Label>
              <Input
                id='dateContrat'
                type='date'
                value={formData.dateContrat ?? ''}
                onChange={(e) => handleChange('dateContrat', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateDebut' className='text-sm font-medium'>
                Date début
              </Label>
              <Input
                id='dateDebut'
                type='date'
                value={formData.dateDebut ?? ''}
                onChange={(e) => handleChange('dateDebut', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateFin' className='text-sm font-medium'>
                Date fin
              </Label>
              <Input
                id='dateFin'
                type='date'
                value={formData.dateFin ?? ''}
                onChange={(e) => handleChange('dateFin', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='montant' className='text-sm font-medium'>
                Montant
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
