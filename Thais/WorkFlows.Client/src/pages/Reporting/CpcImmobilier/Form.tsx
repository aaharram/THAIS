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
import {
  CPC_CHAMPS,
  CpcImmobilierRequest,
  CpcImmobilierRequestSchema,
} from '@/store/features/patrimoine/cpc-immobilier-schemas';
import {
  createCpcImmobilier,
  editCpcImmobilier,
  getCpcImmobilierById,
} from '@/store/features/patrimoine/cpcImmobilierSlice';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { useAppSelector } from '@/store/hooks';
import { BarChart3, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import { AppDispatch } from '@/store';

const backPath = '/reporting/cpc-immobilier';

const emptyForm: CpcImmobilierRequest = {
  noBuilding: 0,
  annee: new Date().getFullYear(),
  revenusImmobilierVie: 0,
  revenusImmobilierNonVie: 0,
  plusValuesImmobilieresVie: 0,
  plusValuesImmobilieresNonVie: 0,
  reprisesImmobilieresLoyersVie: 0,
  reprisesImmobilieresLoyersNonVie: 0,
  chargesImmobilieresVie: 0,
  chargesImmobilieresNonVie: 0,
  moinsValuesImmobilieresVie: 0,
  moinsValuesImmobilieresNonVie: 0,
  dotationsImmobilieresVie: 0,
  dotationsImmobilieresNonVie: 0,
  provisionsImmobilieresVie: 0,
  provisionsImmobilieresNonVie: 0,
  notes: '',
};

const nonVieKey = (key: keyof CpcImmobilierRequest) => key.toString().replace(/Vie$/, 'NonVie') as keyof CpcImmobilierRequest;

const Form = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.cpcImmobilier.item);

  const [formData, setFormData] = useState<CpcImmobilierRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getCpcImmobilierById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noBuilding: item.noBuilding,
        annee: item.annee,
        revenusImmobilierVie: item.revenusImmobilierVie,
        revenusImmobilierNonVie: item.revenusImmobilierNonVie,
        plusValuesImmobilieresVie: item.plusValuesImmobilieresVie,
        plusValuesImmobilieresNonVie: item.plusValuesImmobilieresNonVie,
        reprisesImmobilieresLoyersVie: item.reprisesImmobilieresLoyersVie,
        reprisesImmobilieresLoyersNonVie: item.reprisesImmobilieresLoyersNonVie,
        chargesImmobilieresVie: item.chargesImmobilieresVie,
        chargesImmobilieresNonVie: item.chargesImmobilieresNonVie,
        moinsValuesImmobilieresVie: item.moinsValuesImmobilieresVie,
        moinsValuesImmobilieresNonVie: item.moinsValuesImmobilieresNonVie,
        dotationsImmobilieresVie: item.dotationsImmobilieresVie,
        dotationsImmobilieresNonVie: item.dotationsImmobilieresNonVie,
        provisionsImmobilieresVie: item.provisionsImmobilieresVie,
        provisionsImmobilieresNonVie: item.provisionsImmobilieresNonVie,
        notes: item.notes ?? '',
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof CpcImmobilierRequest>(field: T, value: CpcImmobilierRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: CpcImmobilierRequest) => {
    try {
      CpcImmobilierRequestSchema.parse(data);
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
      await dispatch(editCpcImmobilier({ id: item.numero, updatedItem: formData })).unwrap();
    } else {
      await dispatch(createCpcImmobilier(formData)).unwrap();
    }

    navigate(backPath);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>
          <Title icon={BarChart3} title={item ? 'Modifier le CPC' : 'Ajouter un CPC Immobilier'} />
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        <form onSubmit={handleSubmit}>
          <div className='border rounded-lg overflow-hidden mb-6'>
            <div className='bg-gray-50 px-4 py-3 border-b'>
              <h3 className='text-base font-semibold text-gray-900'>Identification</h3>
            </div>
            <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 [&_input:not([type=checkbox])]:w-full [&_[role=combobox]]:w-full [&_textarea]:w-full'>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  <span className='text-red-500'>* </span>Actif
                </Label>
                <Select
                  value={formData.noBuilding ? String(formData.noBuilding) : ''}
                  onValueChange={(v) => handleChange('noBuilding', Number(v))}
                >
                  <SelectTrigger className={errors.noBuilding ? 'border-red-300' : ''}>
                    <SelectValue placeholder='Sélectionner un actif' />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((b) => (
                      <SelectItem key={b.numero} value={String(b.numero)}>
                        {b.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.noBuilding && <p className='text-red-600 text-sm'>{errors.noBuilding}</p>}
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  <span className='text-red-500'>* </span>Année
                </Label>
                <Input
                  type='number'
                  value={formData.annee}
                  onChange={(e) => handleChange('annee', Number(e.target.value))}
                  className={errors.annee ? 'border-red-300' : ''}
                />
                {errors.annee && <p className='text-red-600 text-sm'>{errors.annee}</p>}
              </div>
            </div>
          </div>

          <div className='border rounded-lg overflow-hidden'>
            <div className='bg-gray-50 px-4 py-3 border-b'>
              <h3 className='text-base font-semibold text-gray-900'>Rubriques (MAD)</h3>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='text-left text-gray-500 border-b'>
                    <th className='py-2 px-4 font-medium'>Rubrique</th>
                    <th className='py-2 px-4 font-medium'>Vie</th>
                    <th className='py-2 px-4 font-medium'>Non Vie</th>
                  </tr>
                </thead>
                <tbody>
                  {CPC_CHAMPS.map((champ) => (
                    <tr key={champ.key} className='border-b last:border-b-0'>
                      <td className='py-2 px-4 font-medium'>{champ.label}</td>
                      <td className='py-2 px-4'>
                        <Input
                          type='number'
                          step='0.01'
                          value={formData[champ.key] as number}
                          onChange={(e) => handleChange(champ.key, Number(e.target.value))}
                        />
                      </td>
                      <td className='py-2 px-4'>
                        <Input
                          type='number'
                          step='0.01'
                          value={formData[nonVieKey(champ.key)] as number}
                          onChange={(e) => handleChange(nonVieKey(champ.key), Number(e.target.value))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className='space-y-2 mt-6'>
            <Label className='text-sm font-medium'>Notes</Label>
            <Input value={formData.notes ?? ''} onChange={(e) => handleChange('notes', e.target.value)} />
          </div>
        </form>
      </CardContent>
      <Separator />
      <CardFooter className='flex justify-end gap-2 mt-6'>
        <Button variant='outline'
          className='border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary' onClick={() => navigate(backPath)}>
          <ArrowLeft />
          Retour
        </Button>
        <Button onClick={handleSubmit}><Save />{item ? 'Mettre à jour' : 'Sauvegarder'}</Button>
      </CardFooter>
    </Card>
  );
};

export default Form;
