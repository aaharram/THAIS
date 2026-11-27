import { BaseDialog } from '@/components/dialog/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/title';
import { AppDispatch, RootState } from '@/store';
import {
  TypologieChargeRequest,
  TypologieChargeRequestSchema,
} from '@/store/features/configuration/typologieCharge-schemas';
import {
  createTypologieCharge,
  editTypologieCharge,
  deleteTypologieCharge,
  getTypologieChargeById,
  resetTypologieCharge,
} from '@/store/features/configuration/typologiesChargeSlice';
import { useAppSelector } from '@/store/hooks';
import { DollarSign, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/configuration-globale/reference-dediee/typologies-charge';

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.cfgTypologiesCharge.item);

  const [formData, setFormData] = useState<TypologieChargeRequest>({
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
    typologie: '',
    compte: '',
    description: '',
  });

  useEffect(() => {
    if (id) {
      dispatch(getTypologieChargeById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        typologie: item.typologie ?? '',
        compte: item.compte ?? '',
        description: item.description ?? '',
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof TypologieChargeRequest>(
    field: T,
    value: TypologieChargeRequest[T],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: TypologieChargeRequest) => {
    try {
      TypologieChargeRequestSchema.parse(data);
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
      await dispatch(editTypologieCharge({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetTypologieCharge());
    } else {
      await dispatch(createTypologieCharge(formData)).unwrap();
    }

    navigate(backPath);
  };

  const confirmDelete = () => {
    if (item) {
      dispatch(deleteTypologieCharge(item.numero));
      dispatch(resetTypologieCharge());
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
                ? `Détails "${formData.typologie}"`
                : item
                ? `Modifier "${formData.typologie}"`
                : 'Ajouter une typologie de charge'
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
                <DollarSign className='h-4 w-4' />
              </div>
              <h3 className='text-base font-semibold text-gray-900'>Typologie Charges</h3>
            </div>

            <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 [&_input:not([type=checkbox])]:w-full [&_[role=combobox]]:w-full [&_textarea]:w-full'>
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
                <Label htmlFor='typologie' className='text-sm font-medium'>
                  Typologie
                </Label>
                <Input
                  id='typologie'
                  value={formData.typologie}
                  onChange={(e) => handleChange('typologie', e.target.value)}
                  disabled={changeToDetails}
                  className={errors.typologie ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.typologie && <p className='text-red-600 text-sm'>{errors.typologie}</p>}
              </div>

              <div className='space-y-2 col-span-full'>
                <Label htmlFor='description' className='text-sm font-medium'>
                  Description
                </Label>
                <Textarea
                  id='description'
                  rows={4}
                  value={formData.description ?? ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={changeToDetails}
                />
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
        description={`Êtes-vous sûr de vouloir supprimer "${formData.typologie}" ?`}
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
