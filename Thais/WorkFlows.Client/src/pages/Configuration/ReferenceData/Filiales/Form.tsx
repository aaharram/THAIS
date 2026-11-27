import { BaseDialog } from '@/components/dialog/dialog';
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
import { lookupModules } from '@/store/features/configuration/lookupModules';
import {
  FilialeRequest,
  FilialeRequestSchema,
  MODES_REGLEMENT,
} from '@/store/features/configuration/filiale-schemas';
import {
  createFiliale,
  editFiliale,
  deleteFiliale,
  getFilialeById,
  resetFiliale,
} from '@/store/features/configuration/filialesSlice';
import { useAppSelector } from '@/store/hooks';
import { Info, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/configuration-globale/reference-dediee/filiales';

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.cfgFiliales.item);
  const { allItems: allBanques } = useAppSelector((state) => state.cfgBanques);

  const [formData, setFormData] = useState<FilialeRequest>({
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
    nom: '',
    numeroReference: '',
    date: '',
    rib: '',
    noBanque: null,
    modeReglement: null,
  });

  useEffect(() => {
    dispatch(lookupModules.cfgBanques.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getFilialeById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        nom: item.nom ?? '',
        numeroReference: item.numeroReference ?? '',
        date: item.date ? item.date.substring(0, 10) : '',
        rib: item.rib ?? '',
        noBanque: item.noBanque ?? null,
        modeReglement: item.modeReglement ?? null,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof FilialeRequest>(field: T, value: FilialeRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: FilialeRequest) => {
    try {
      FilialeRequestSchema.parse(data);
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
      await dispatch(editFiliale({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetFiliale());
    } else {
      await dispatch(createFiliale(formData)).unwrap();
    }

    navigate(backPath);
  };

  const confirmDelete = () => {
    if (item) {
      dispatch(deleteFiliale(item.numero));
      dispatch(resetFiliale());
      navigate(backPath);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle className='flex justify-between'>
          <Title
            title={
              changeToDetails
                ? `Détails "${formData.nom}"`
                : item
                ? `Modifier "${formData.nom}"`
                : 'Ajouter une filiale'
            }
          />
          {item && (
            <div className='flex justify-end gap-2'>
              <Button onClick={() => setChangeToDetails(!changeToDetails)}>
                {changeToDetails ? 'Modifier' : 'Détails'}
              </Button>
              <Button variant='destructive' onClick={() => setDeleteDialogOpen(true)}>
                Supprimer
              </Button>
            </div>
          )}
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
              <h3 className='text-base font-semibold text-gray-900'>Filiale</h3>
            </div>

            <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 [&_input:not([type=checkbox])]:w-full [&_[role=combobox]]:w-full [&_textarea]:w-full'>
              <div className='space-y-2'>
                <Label htmlFor='nom' className='text-sm font-medium'>
                  Filiale
                </Label>
                <Input
                  id='nom'
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  disabled={changeToDetails}
                  className={errors.nom ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.nom && <p className='text-red-600 text-sm'>{errors.nom}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='numeroReference' className='text-sm font-medium'>
                  Numero de Référence
                </Label>
                <Input
                  id='numeroReference'
                  value={formData.numeroReference ?? ''}
                  onChange={(e) => handleChange('numeroReference', e.target.value)}
                  disabled={changeToDetails}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='date' className='text-sm font-medium'>
                  Date
                </Label>
                <Input
                  id='date'
                  type='date'
                  value={formData.date ?? ''}
                  onChange={(e) => handleChange('date', e.target.value)}
                  disabled={changeToDetails}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='rib' className='text-sm font-medium'>
                  RIB
                </Label>
                <Input
                  id='rib'
                  value={formData.rib ?? ''}
                  onChange={(e) => handleChange('rib', e.target.value)}
                  disabled={changeToDetails}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='noBanque' className='text-sm font-medium'>
                  Banque
                </Label>
                <Select
                  value={formData.noBanque?.toString() || '0'}
                  onValueChange={(value) =>
                    handleChange('noBanque', value === '0' ? null : Number(value))
                  }
                  disabled={changeToDetails}
                >
                  <SelectTrigger id='noBanque'>
                    <SelectValue placeholder='Sélectionnez une banque...' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Aucune banque</SelectItem>
                    {allBanques.map((b) => (
                      <SelectItem key={b.numero} value={b.numero.toString()}>
                        {b.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='modeReglement' className='text-sm font-medium'>
                  Mode de règlement
                </Label>
                <Select
                  value={formData.modeReglement ?? ''}
                  onValueChange={(value) => handleChange('modeReglement', value)}
                  disabled={changeToDetails}
                >
                  <SelectTrigger id='modeReglement'>
                    <SelectValue placeholder='Sélectionnez un mode...' />
                  </SelectTrigger>
                  <SelectContent>
                    {MODES_REGLEMENT.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
        {!changeToDetails && (
          <Button onClick={handleSubmit}><Save />{item ? 'Mettre à jour' : 'Sauvegarder'}</Button>
        )}
      </CardFooter>

      <BaseDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Confirmer la suppression'
        description={`Êtes-vous sûr de vouloir supprimer "${formData.nom}" ?`}
      >
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
            Annuler
          </Button>
          <Button variant='destructive' onClick={confirmDelete}>
            Supprimer
          </Button>
        </div>
      </BaseDialog>
    </Card>
  );
};

export default Form;
