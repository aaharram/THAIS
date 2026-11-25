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
import { lookupModules } from '@/store/features/configuration/lookupModules';
import {
  AssuranceRequest,
  AssuranceRequestSchema,
  STATUTS_ASSURANCE,
} from '@/store/features/property-management/assurance-schemas';
import {
  createAssurance,
  editAssurance,
  getAssuranceById,
  resetAssurance,
} from '@/store/features/property-management/assurancesSlice';
import { useAppSelector } from '@/store/hooks';
import { Info, Shield, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/property-management/assurances';

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

const emptyForm: AssuranceRequest = {
  numPolice: '',
  noAssureur: 0,
  noCourtier: null,
  typeCouverture: '',
  dateEffetContrat: '',
  montant: null,
  statut: 'EnCours',
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

  const item = useAppSelector((state: RootState) => state.assurancesPm.item);
  const { allItems: assureurs } = useAppSelector((state) => state.cfgAssureurs);
  const { allItems: courtiers } = useAppSelector((state) => state.cfgCourtiers);

  const [formData, setFormData] = useState<AssuranceRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(lookupModules.cfgAssureurs.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgCourtiers.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getAssuranceById(Number(id)));
    }
  }, [id, dispatch]);

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        numPolice: item.numPolice ?? '',
        noAssureur: item.noAssureur,
        noCourtier: item.noCourtier ?? null,
        typeCouverture: item.typeCouverture ?? '',
        dateEffetContrat: item.dateEffetContrat ? item.dateEffetContrat.substring(0, 10) : '',
        montant: item.montant ?? null,
        statut: item.statut,
        notes: item.notes ?? '',
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof AssuranceRequest>(field: T, value: AssuranceRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: AssuranceRequest) => {
    try {
      AssuranceRequestSchema.parse(data);
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
      await dispatch(editAssurance({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetAssurance());
    } else {
      await dispatch(createAssurance(formData)).unwrap();
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
                ? `Détails assurance — ${item?.numPolice ?? ''}`
                : item
                ? `Modifier assurance — ${item.numPolice ?? ''}`
                : 'Ajouter une assurance'
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
          <Section icon={Shield} title='Informations'>
            <div className='space-y-2'>
              <Label htmlFor='numPolice' className='text-sm font-medium'>
                N° Police
              </Label>
              <Input
                id='numPolice'
                value={formData.numPolice ?? ''}
                onChange={(e) => handleChange('numPolice', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noAssureur' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Assureur
              </Label>
              <Select
                value={formData.noAssureur ? formData.noAssureur.toString() : ''}
                onValueChange={(value) => handleChange('noAssureur', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noAssureur' className={errors.noAssureur ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {assureurs.map((a) => (
                    <SelectItem key={a.numero} value={a.numero.toString()}>
                      {a.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.noAssureur && <p className='text-red-600 text-sm'>{errors.noAssureur}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noCourtier' className='text-sm font-medium'>
                Courtier
              </Label>
              <Select
                value={formData.noCourtier?.toString() || '0'}
                onValueChange={(value) => handleChange('noCourtier', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noCourtier'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucun</SelectItem>
                  {courtiers.map((c) => (
                    <SelectItem key={c.numero} value={c.numero.toString()}>
                      {c.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='typeCouverture' className='text-sm font-medium'>
                Type de couverture
              </Label>
              <Input
                id='typeCouverture'
                value={formData.typeCouverture ?? ''}
                onChange={(e) => handleChange('typeCouverture', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dateEffetContrat' className='text-sm font-medium'>
                Date d'effet
              </Label>
              <Input
                id='dateEffetContrat'
                type='date'
                value={formData.dateEffetContrat ?? ''}
                onChange={(e) => handleChange('dateEffetContrat', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
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

            <div className='space-y-2'>
              <Label htmlFor='statut' className='text-sm font-medium'>
                Statut
              </Label>
              <Select
                value={formData.statut}
                onValueChange={(value) => handleChange('statut', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='statut'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS_ASSURANCE.map((s) => (
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
