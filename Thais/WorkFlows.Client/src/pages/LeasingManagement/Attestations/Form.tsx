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
import { Title } from '@/components/ui/title';
import { AppDispatch, RootState } from '@/store';
import {
  AttestationRequest,
  AttestationRequestSchema,
  TYPES_ATTESTATION,
} from '@/store/features/leasing/attestation-schemas';
import {
  createAttestation,
  editAttestation,
  getAttestationById,
  resetAttestation,
} from '@/store/features/leasing/attestationsSlice';
import { getAllBaux } from '@/store/features/leasing/bauxSlice';
import { useAppSelector } from '@/store/hooks';
import { FileText, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/leasing-management/attestations';

const emptyForm: AttestationRequest = {
  noLocation: 0,
  noLocataire: 0,
  typeAttestation: 'Attestation regularité fiscal',
  dateAttestation: '',
  dateDebut: '',
  dateFin: '',
  inactif: false,
};

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.attestations.item);
  const { allItems: baux } = useAppSelector((state) => state.baux);

  const [formData, setFormData] = useState<AttestationRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBaux({ pageNumber: 1, pageSize: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getAttestationById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noLocation: item.noLocation,
        noLocataire: item.noLocataire,
        typeAttestation: item.typeAttestation,
        dateAttestation: item.dateAttestation ? item.dateAttestation.substring(0, 10) : '',
        dateDebut: item.dateDebut ? item.dateDebut.substring(0, 10) : '',
        dateFin: item.dateFin ? item.dateFin.substring(0, 10) : '',
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof AttestationRequest>(field: T, value: AttestationRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedBail = baux.find((b) => b.numero === formData.noLocation);

  const validate = (data: AttestationRequest) => {
    try {
      AttestationRequestSchema.parse(data);
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
      await dispatch(editAttestation({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetAttestation());
    } else {
      await dispatch(createAttestation(formData)).unwrap();
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
                ? `Détails attestation — ${item?.nomLocataire ?? ''}`
                : item
                ? `Modifier attestation — ${item.nomLocataire ?? ''}`
                : 'Ajouter une attestation'
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
          <Section icon={FileText} title='Informations'>
            <FormGroupTitle>Contrat</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='noLocation' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Contrats
              </Label>
              <Select
                value={formData.noLocation ? formData.noLocation.toString() : ''}
                onValueChange={(value) => {
                  const bail = baux.find((b) => b.numero === Number(value));
                  setFormData((prev) => ({
                    ...prev,
                    noLocation: Number(value),
                    noLocataire: bail?.noLocataire ?? 0,
                  }));
                }}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noLocation' className={errors.noLocation ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez un contrat...' />
                </SelectTrigger>
                <SelectContent>
                  {baux.map((b) => (
                    <SelectItem key={b.numero} value={b.numero.toString()}>
                      {b.numContratLocations || `Bail #${b.numero}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.noLocation && <p className='text-red-600 text-sm'>{errors.noLocation}</p>}
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='client' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Clients
              </Label>
              <Input id='client' value={selectedBail?.nomLocataire ?? ''} disabled readOnly className='bg-gray-50' />
              {errors.noLocataire && <p className='text-red-600 text-sm'>{errors.noLocataire}</p>}
            </div>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='typeAttestation' className='text-sm font-medium'>
                Type attestation
              </Label>
              <Select
                value={formData.typeAttestation}
                onValueChange={(value) => handleChange('typeAttestation', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='typeAttestation'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_ATTESTATION.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormGroupTitle>Période</FormGroupTitle>

            <div className='min-w-0 space-y-1.5 col-span-12 sm:col-span-6 md:col-span-4'>
              <Label htmlFor='dateAttestation' className='text-sm font-medium'>
                Date attestation
              </Label>
              <Input
                id='dateAttestation'
                type='date'
                value={formData.dateAttestation ?? ''}
                onChange={(e) => handleChange('dateAttestation', e.target.value)}
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
