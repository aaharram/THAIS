import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Title } from '@/components/ui/title';
import { RootState } from '@/store';
import {
  TableauAmortissementRequest,
  TableauAmortissementRequestSchema,
} from '@/store/features/patrimoine/amortissement-schemas';
import {
  createAmortissement,
  editAmortissement,
  getAmortissementById,
  resetAmortissement,
} from '@/store/features/patrimoine/amortissementsSlice';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { getAllTypologiesImmobilisation } from '@/store/features/configuration/typologiesImmobilisationSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Info, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/patrimoine/amortissements';

const emptyForm: TableauAmortissementRequest = {
  noBuilding: 0,
  immobConcernees: 0,
  dateEntree: '',
  vaPrixAcquisition: 0,
  valeurTerrain: null,
  valeurConstruction: null,
  valeurAmenagement: null,
  immobPrincipal: false,
  inactif: false,
};

const Form = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.amortissements.item);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: typologies } = useAppSelector((state) => state.cfgTypologiesImmobilisation);

  const [formData, setFormData] = useState<TableauAmortissementRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 100 }));
    dispatch(getAllTypologiesImmobilisation({ pageNumber: 1, pageSize: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getAmortissementById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noBuilding: item.noBuilding,
        immobConcernees: item.immobConcernees,
        dateEntree: item.dateEntree ? item.dateEntree.substring(0, 10) : '',
        vaPrixAcquisition: item.vaPrixAcquisition,
        valeurTerrain: item.valeurTerrain ?? null,
        valeurConstruction: item.valeurConstruction ?? null,
        valeurAmenagement: item.valeurAmenagement ?? null,
        immobPrincipal: item.immobPrincipal,
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const selectedTypologie = typologies.find((t) => t.numero === formData.immobConcernees);

  const handleChange = <T extends keyof TableauAmortissementRequest>(
    field: T,
    value: TableauAmortissementRequest[T],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  const validate = (data: TableauAmortissementRequest) => {
    try {
      TableauAmortissementRequestSchema.parse(data);
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
      await dispatch(editAmortissement({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetAmortissement());
    } else {
      await dispatch(createAmortissement(formData)).unwrap();
    }

    navigate(backPath);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>
          <Title title={item ? "Modifier l'amortissement" : 'Ajouter un amortissement'} />
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        <form onSubmit={handleSubmit}>
          <div className='border rounded-lg overflow-hidden'>
            <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
              <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
                <Info className='h-4 w-4' />
              </div>
              <h3 className='text-base font-semibold text-gray-900'>Informations</h3>
            </div>

            <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 [&_input:not([type=checkbox])]:w-full [&_[role=combobox]]:w-full [&_textarea]:w-full'>
              <div className='space-y-2'>
                <Label htmlFor='noBuilding' className='text-sm font-medium'>
                  Actif
                </Label>
                <Select
                  value={formData.noBuilding ? formData.noBuilding.toString() : ''}
                  onValueChange={(value) => handleChange('noBuilding', Number(value))}                >
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
                <Label htmlFor='immobConcernees' className='text-sm font-medium'>
                  Immobilisations concernées
                </Label>
                <Select
                  value={formData.immobConcernees ? formData.immobConcernees.toString() : ''}
                  onValueChange={(value) => handleChange('immobConcernees', Number(value))}                >
                  <SelectTrigger id='immobConcernees' className={errors.immobConcernees ? 'border-red-300' : ''}>
                    <SelectValue placeholder='Sélectionnez...' />
                  </SelectTrigger>
                  <SelectContent>
                    {typologies.map((t) => (
                      <SelectItem key={t.numero} value={t.numero.toString()}>
                        {t.immobilisationConcernee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.immobConcernees && <p className='text-red-600 text-sm'>{errors.immobConcernees}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='dateEntree' className='text-sm font-medium'>
                  Date d'entrée
                </Label>
                <Input
                  id='dateEntree'
                  type='date'
                  value={formData.dateEntree ?? ''}
                  onChange={(e) => handleChange('dateEntree', e.target.value)}                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='vaPrixAcquisition' className='text-sm font-medium'>
                  Valeur d'entrée
                </Label>
                <Input
                  id='vaPrixAcquisition'
                  type='number'
                  step='0.01'
                  value={formData.vaPrixAcquisition ?? ''}
                  onChange={(e) => handleChange('vaPrixAcquisition', Number(e.target.value))}                  className={errors.vaPrixAcquisition ? 'border-red-300' : ''}
                />
                {errors.vaPrixAcquisition && (
                  <p className='text-red-600 text-sm'>{errors.vaPrixAcquisition}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='valeurTerrain' className='text-sm font-medium'>
                  Valeur Terrain
                </Label>
                <Input
                  id='valeurTerrain'
                  type='number'
                  step='0.01'
                  value={formData.valeurTerrain ?? ''}
                  onChange={(e) => handleChange('valeurTerrain', numOrNull(e.target.value))}                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='valeurConstruction' className='text-sm font-medium'>
                  Valeur Construction
                </Label>
                <Input
                  id='valeurConstruction'
                  type='number'
                  step='0.01'
                  value={formData.valeurConstruction ?? ''}
                  onChange={(e) => handleChange('valeurConstruction', numOrNull(e.target.value))}                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='valeurAmenagement' className='text-sm font-medium'>
                  Valeur Amenagement
                </Label>
                <Input
                  id='valeurAmenagement'
                  type='number'
                  step='0.01'
                  value={formData.valeurAmenagement ?? ''}
                  onChange={(e) => handleChange('valeurAmenagement', numOrNull(e.target.value))}                />
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Amortissements antérieurs</Label>
                <Input value={item?.amortiAnterieurs ?? '-'} readOnly disabled className='bg-gray-50' />
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Amortissements Taux</Label>
                <Input
                  value={item?.amortiDbeneficebTaux ?? selectedTypologie?.taux ?? '-'}
                  readOnly
                  disabled
                  className='bg-gray-50'
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Amortissements Durée</Label>
                <Input
                  value={item?.amortiDbenficebDuree ?? selectedTypologie?.duree ?? '-'}
                  readOnly
                  disabled
                  className='bg-gray-50'
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Amortissements normaux</Label>
                <Input value={item?.amortiDbeneficebNorm ?? '-'} readOnly disabled className='bg-gray-50' />
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Total des amortissements</Label>
                <Input value={item?.totalAmortiAlaFin ?? '-'} readOnly disabled className='bg-gray-50' />
              </div>

              <div className='flex items-center gap-2 pt-6'>
                <Checkbox
                  id='immobPrincipal'
                  checked={formData.immobPrincipal}
                  onCheckedChange={(c) => handleChange('immobPrincipal', c === true)}                />
                <Label htmlFor='immobPrincipal'>Immobilisation Principal</Label>
              </div>
            </div>
          </div>
        </form>

        <div className='border rounded-lg overflow-hidden'>
          <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
            <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
              <Info className='h-4 w-4' />
            </div>
            <h3 className='text-base font-semibold text-gray-900'>Versions</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amortissements Antérieurs</TableHead>
                <TableHead>Amortissements Normaux</TableHead>
                <TableHead>Date d'amortissement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {item && item.versions.length > 0 ? (
                item.versions.map((v) => (
                  <TableRow key={v.numero}>
                    <TableCell>{v.amortissementsAnterieurs}</TableCell>
                    <TableCell>{v.amortissementsNormaux}</TableCell>
                    <TableCell>{new Date(v.dateAmortissement).toLocaleDateString('fr-FR')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className='text-center text-gray-500'>
                    Aucune version
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
