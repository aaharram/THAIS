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
import { RootState } from '@/store';
import { VncRequest, VncRequestSchema } from '@/store/features/patrimoine/vnc-schemas';
import { createVnc, editVnc, getVncById, resetVnc } from '@/store/features/patrimoine/vncSlice';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Info, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { z } from 'zod';

const backPath = '/patrimoine/vnc';

const Form = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.vnc.item);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);

  const preselectedBuilding = Number(searchParams.get('building')) || 0;

  const [formData, setFormData] = useState<VncRequest>({
    noBuilding: preselectedBuilding,
    montantVNC: null,
    dateVNC: '',
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getVncById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noBuilding: item.noBuilding,
        montantVNC: item.montantVNC ?? null,
        dateVNC: item.dateVNC ? item.dateVNC.substring(0, 10) : '',
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof VncRequest>(field: T, value: VncRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  const validate = (data: VncRequest) => {
    try {
      VncRequestSchema.parse(data);
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
      await dispatch(editVnc({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetVnc());
    } else {
      await dispatch(createVnc(formData)).unwrap();
    }

    navigate(backPath);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>
          <Title title={item ? 'Modifier la VNC' : 'Ajouter une VNC'} />
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className='py-6 px-4 sm:px-6'>
        <form onSubmit={handleSubmit}>
          <div className='border rounded-lg overflow-hidden'>
            <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
              <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
                <Info className='h-4 w-4' />
              </div>
              <h3 className='text-base font-semibold text-gray-900'>Informations</h3>
            </div>

            <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='noBuilding' className='text-sm font-medium'>
                  <span className='text-red-500'>* </span>Actif
                </Label>
                <Select
                  value={formData.noBuilding ? formData.noBuilding.toString() : ''}
                  onValueChange={(value) => handleChange('noBuilding', Number(value))}
                >
                  <SelectTrigger id='noBuilding' className={errors.noBuilding ? 'border-red-300' : ''}>
                    <SelectValue placeholder='Tous les actifs' />
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
                <Label htmlFor='montantVNC' className='text-sm font-medium'>
                  Montant VNC
                </Label>
                <Input
                  id='montantVNC'
                  type='number'
                  step='0.01'
                  value={formData.montantVNC ?? ''}
                  onChange={(e) => handleChange('montantVNC', numOrNull(e.target.value))}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='dateVNC' className='text-sm font-medium'>
                  Date VNC
                </Label>
                <Input
                  id='dateVNC'
                  type='date'
                  value={formData.dateVNC ?? ''}
                  onChange={(e) => handleChange('dateVNC', e.target.value)}
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <Separator />
      <CardFooter className='flex justify-end gap-2 mt-6'>
        <Button variant='secondary' onClick={() => navigate(backPath)}>
          <ArrowLeft />
          Retour
        </Button>
        <Button onClick={handleSubmit}><Save />{item ? 'Mettre à jour' : 'Sauvegarder'}</Button>
      </CardFooter>
    </Card>
  );
};

export default Form;
