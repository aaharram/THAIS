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
import { getAllPrestataires } from '@/store/features/property-management/prestatairesSlice';
import {
  BonDeCommandeRequest,
  BonDeCommandeRequestSchema,
  STATUTS_APPROBATION_BON_COMMANDE,
} from '@/store/features/property-management/bon-de-commande-schemas';
import {
  createBonDeCommande,
  editBonDeCommande,
  getBonDeCommandeById,
  resetBonDeCommande,
} from '@/store/features/property-management/bonsDeCommandeSlice';
import { useAppSelector } from '@/store/hooks';
import { FileText, Info, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/property-management/bon-de-commande';

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Info;
  title: string;
  children: React.ReactNode;
}) => (
  <div className='border rounded-lg overflow-hidden'>
    <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
      <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
        <Icon className='h-4 w-4' />
      </div>
      <h3 className='text-base font-semibold text-gray-900'>{title}</h3>
    </div>
    <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4'>{children}</div>
  </div>
);

const emptyForm: BonDeCommandeRequest = {
  numeroBonCommande: '',
  noPrestataire: 0,
  dateCommande: '',
  dateReception: '',
  compte: '',
  compteComptable: '',
  statutApprobation: 'En attente',
  notes: '',
};

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.bonsDeCommandePm.item);
  const { allItems: prestataires } = useAppSelector((state) => state.prestataires);

  const [formData, setFormData] = useState<BonDeCommandeRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllPrestataires({ pageNumber: 1, pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getBonDeCommandeById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        numeroBonCommande: item.numeroBonCommande,
        noPrestataire: item.noPrestataire,
        dateCommande: item.dateCommande ? item.dateCommande.substring(0, 10) : '',
        dateReception: item.dateReception ? item.dateReception.substring(0, 10) : '',
        compte: item.compte ?? '',
        compteComptable: item.compteComptable ?? '',
        statutApprobation: item.statutApprobation,
        notes: item.notes ?? '',
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof BonDeCommandeRequest>(field: T, value: BonDeCommandeRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: BonDeCommandeRequest) => {
    try {
      BonDeCommandeRequestSchema.parse(data);
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
      await dispatch(editBonDeCommande({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetBonDeCommande());
    } else {
      await dispatch(createBonDeCommande(formData)).unwrap();
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
                ? `Détails bon de commande — ${item?.numeroBonCommande ?? ''}`
                : item
                ? `Modifier bon de commande — ${item.numeroBonCommande ?? ''}`
                : 'Ajouter un bon de commande'
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
            <div className='space-y-2'>
              <Label htmlFor='numeroBonCommande' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>N° Bon de commande
              </Label>
              <Input
                id='numeroBonCommande'
                value={formData.numeroBonCommande ?? ''}
                onChange={(e) => handleChange('numeroBonCommande', e.target.value)}
                disabled={changeToDetails}
                className={errors.numeroBonCommande ? 'border-red-300' : ''}
              />
              {errors.numeroBonCommande && <p className='text-red-600 text-sm'>{errors.numeroBonCommande}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noPrestataire' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Prestataire
              </Label>
              <Select
                value={formData.noPrestataire ? formData.noPrestataire.toString() : ''}
                onValueChange={(value) => handleChange('noPrestataire', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noPrestataire' className={errors.noPrestataire ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez...' />
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

            <div className='space-y-2'>
              <Label htmlFor='dateCommande' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Date de commande
              </Label>
              <Input
                id='dateCommande'
                type='date'
                value={formData.dateCommande ?? ''}
                onChange={(e) => handleChange('dateCommande', e.target.value)}
                disabled={changeToDetails}
                className={errors.dateCommande ? 'border-red-300' : ''}
              />
              {errors.dateCommande && <p className='text-red-600 text-sm'>{errors.dateCommande}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dateReception' className='text-sm font-medium'>
                Date de réception
              </Label>
              <Input
                id='dateReception'
                type='date'
                value={formData.dateReception ?? ''}
                onChange={(e) => handleChange('dateReception', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='compte' className='text-sm font-medium'>
                Compte
              </Label>
              <Input
                id='compte'
                value={formData.compte ?? ''}
                onChange={(e) => handleChange('compte', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='compteComptable' className='text-sm font-medium'>
                Compte comptable
              </Label>
              <Input
                id='compteComptable'
                value={formData.compteComptable ?? ''}
                onChange={(e) => handleChange('compteComptable', e.target.value)}
                disabled={changeToDetails}
                placeholder='Ex: 21000...'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='statutApprobation' className='text-sm font-medium'>
                Statut d'approbation
              </Label>
              <Select
                value={formData.statutApprobation ?? 'En attente'}
                onValueChange={(value) => handleChange('statutApprobation', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='statutApprobation'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS_APPROBATION_BON_COMMANDE.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                disabled={changeToDetails}
              />
            </div>
          </Section>
        </form>
      </CardContent>
      <Separator />
      <CardFooter className='flex justify-end gap-2 mt-6'>
        <Button variant='secondary' onClick={() => navigate(backPath)}>
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
