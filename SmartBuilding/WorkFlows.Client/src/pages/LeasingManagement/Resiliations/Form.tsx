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
import { Title } from '@/components/ui/title';
import { AppDispatch, RootState } from '@/store';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { getAllBaux } from '@/store/features/leasing/bauxSlice';
import {
  ORIGINES_RESILIATION,
  ResiliationRequest,
  ResiliationRequestSchema,
  STATUTS_RESILIATION,
  TYPES_RESILIATION,
} from '@/store/features/leasing/resiliation-schemas';
import {
  createResiliation,
  editResiliation,
  getResiliationById,
  resetResiliation,
} from '@/store/features/leasing/resiliationsSlice';
import { useAppSelector } from '@/store/hooks';
import { Info, XCircle, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/leasing-management/resiliations';

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

const emptyForm: ResiliationRequest = {
  noBuilding: 0,
  noContrat: 0,
  typeResiliation: 'Amiable',
  motifResiliation: '',
  durePreavis: '',
  origineResiliation: 'Client',
  statutValidation: 'Nouveau',
  dateResiliation: '',
  dateReception: '',
  dateRestitutionActif: '',
  inactif: false,
};

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.resiliations.item);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: baux } = useAppSelector((state) => state.baux);

  const [formData, setFormData] = useState<ResiliationRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getResiliationById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (formData.noBuilding) {
      dispatch(getAllBaux({ pageNumber: 1, pageSize: 100, filters: { NoBuilding: [formData.noBuilding] } }));
    }
  }, [formData.noBuilding, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noBuilding: item.noBuilding,
        noContrat: item.noContrat,
        typeResiliation: item.typeResiliation,
        motifResiliation: item.motifResiliation ?? '',
        durePreavis: item.durePreavis ?? '',
        origineResiliation: item.origineResiliation,
        statutValidation: item.statutValidation,
        dateResiliation: item.dateResiliation ? item.dateResiliation.substring(0, 10) : '',
        dateReception: item.dateReception ? item.dateReception.substring(0, 10) : '',
        dateRestitutionActif: item.dateRestitutionActif ? item.dateRestitutionActif.substring(0, 10) : '',
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof ResiliationRequest>(field: T, value: ResiliationRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: ResiliationRequest) => {
    try {
      ResiliationRequestSchema.parse(data);
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
      await dispatch(editResiliation({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetResiliation());
    } else {
      await dispatch(createResiliation(formData)).unwrap();
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
                ? `Détails résiliation — ${item?.nomLocataire ?? ''}`
                : item
                ? `Modifier résiliation — ${item.nomLocataire ?? ''}`
                : 'Ajouter une résiliation'
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
        {Object.keys(errors).length > 0 && (
          <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
            {Object.values(errors).join(' ')}
          </div>
        )}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <Section icon={XCircle} title='Informations'>
            <div className='space-y-2'>
              <Label htmlFor='noBuilding' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Actif
              </Label>
              <Select
                value={formData.noBuilding ? formData.noBuilding.toString() : ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, noBuilding: Number(value), noContrat: 0 }))
                }
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

            <div className='space-y-2'>
              <Label htmlFor='noContrat' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>N° Contrat
              </Label>
              <Select
                value={formData.noContrat ? formData.noContrat.toString() : ''}
                onValueChange={(value) => handleChange('noContrat', Number(value))}
                disabled={changeToDetails || !formData.noBuilding}
              >
                <SelectTrigger id='noContrat' className={errors.noContrat ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez un contrat...' />
                </SelectTrigger>
                <SelectContent>
                  {baux.map((b) => (
                    <SelectItem key={b.numero} value={b.numero.toString()}>
                      {b.numContratLocations || `Bail #${b.numero}`} — {b.nomLocataire || ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.noContrat && <p className='text-red-600 text-sm'>{errors.noContrat}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='typeResiliation' className='text-sm font-medium'>
                Type De Résiliation
              </Label>
              <Select
                value={formData.typeResiliation}
                onValueChange={(value) => handleChange('typeResiliation', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='typeResiliation'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_RESILIATION.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='origineResiliation' className='text-sm font-medium'>
                Origine résiliation
              </Label>
              <Select
                value={formData.origineResiliation}
                onValueChange={(value) => handleChange('origineResiliation', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='origineResiliation'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORIGINES_RESILIATION.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='motifResiliation' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Motif résiliation
              </Label>
              <Input
                id='motifResiliation'
                value={formData.motifResiliation ?? ''}
                onChange={(e) => handleChange('motifResiliation', e.target.value)}
                disabled={changeToDetails}
                className={errors.motifResiliation ? 'border-red-300' : ''}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='durePreavis' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Durée de préavis
              </Label>
              <Input
                id='durePreavis'
                value={formData.durePreavis ?? ''}
                onChange={(e) => handleChange('durePreavis', e.target.value)}
                disabled={changeToDetails}
                className={errors.durePreavis ? 'border-red-300' : ''}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dateResiliation' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Date effet résiliation
              </Label>
              <Input
                id='dateResiliation'
                type='date'
                value={formData.dateResiliation ?? ''}
                onChange={(e) => handleChange('dateResiliation', e.target.value)}
                disabled={changeToDetails}
                className={errors.dateResiliation ? 'border-red-300' : ''}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dateReception' className='text-sm font-medium'>
                Date de réception de la demande de résiliation
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
              <Label htmlFor='dateRestitutionActif' className='text-sm font-medium'>
                Date restitution actif
              </Label>
              <Input
                id='dateRestitutionActif'
                type='date'
                value={formData.dateRestitutionActif ?? ''}
                onChange={(e) => handleChange('dateRestitutionActif', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='statutValidation' className='text-sm font-medium'>
                Statut
              </Label>
              <Select
                value={formData.statutValidation}
                onValueChange={(value) => handleChange('statutValidation', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='statutValidation'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS_RESILIATION.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
