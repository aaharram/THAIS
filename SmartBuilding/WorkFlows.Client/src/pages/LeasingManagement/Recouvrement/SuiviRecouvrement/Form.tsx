import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/title';
import { AppDispatch } from '@/store';
import { getBailById } from '@/store/features/leasing/bauxSlice';
import { RelanceRequest, RelanceRequestSchema, TYPES_RELANCE } from '@/store/features/leasing/relance-schemas';
import { creerRelance } from '@/store/features/leasing/relancesSlice';
import { useAppSelector } from '@/store/hooks';
import { HandCoins, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

const backPath = '/leasing-management/recouvrement/suivi-recouvrement';

const Form = () => {
  const [searchParams] = useSearchParams();
  const noLocation = Number(searchParams.get('noLocation')) || 0;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const bail = useAppSelector((state) => state.baux.item);

  useEffect(() => {
    if (noLocation) {
      dispatch(getBailById(noLocation));
    }
  }, [noLocation, dispatch]);

  const [formData, setFormData] = useState<RelanceRequest>({
    addUser: userId,
    noLocation,
    typeRelance: 'Lettre',
    dateRelance: new Date().toISOString().substring(0, 10),
    typeEnvoi: 'Manuel',
    notes: '',
  });

  const handleChange = <T extends keyof RelanceRequest>(field: T, value: RelanceRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: RelanceRequest) => {
    try {
      RelanceRequestSchema.parse(data);
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

    await dispatch(creerRelance(formData)).unwrap();
    navigate(backPath);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>
          <Title
            icon={HandCoins}
            title={`Relancer — ${bail?.nomLocataire ?? ''}`}
            description={bail ? `${bail.nomBuilding ?? ''} · ${bail.nomLocal ?? ''}` : undefined}
          />
        </CardTitle>
      </CardHeader>
      <div className='px-6'>
        <hr />
      </div>
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='typeRelance' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Type de relance
              </Label>
              <Select
                value={formData.typeRelance}
                onValueChange={(value) => handleChange('typeRelance', value)}
              >
                <SelectTrigger id='typeRelance'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_RELANCE.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.typeRelance && <p className='text-red-600 text-sm'>{errors.typeRelance}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dateRelance' className='text-sm font-medium'>
                Date de relance
              </Label>
              <Input
                id='dateRelance'
                type='date'
                value={formData.dateRelance ?? ''}
                onChange={(e) => handleChange('dateRelance', e.target.value)}
              />
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
        <Button onClick={handleSubmit}><Save />Enregistrer la relance</Button>
      </CardFooter>
    </Card>
  );
};

export default Form;
