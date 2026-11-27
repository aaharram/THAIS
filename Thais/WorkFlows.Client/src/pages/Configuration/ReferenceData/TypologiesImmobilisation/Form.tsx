import { BaseDialog } from '@/components/dialog/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Title } from '@/components/ui/title';
import { AppDispatch, RootState } from '@/store';
import {
  TypologieImmobilisationRequest,
  TypologieImmobilisationRequestSchema,
} from '@/store/features/configuration/typologieImmobilisation-schemas';
import {
  createTypologieImmobilisation,
  editTypologieImmobilisation,
  deleteTypologieImmobilisation,
  getTypologieImmobilisationById,
  resetTypologieImmobilisation,
} from '@/store/features/configuration/typologiesImmobilisationSlice';
import { useAppSelector } from '@/store/hooks';
import { Info, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/configuration-globale/reference-dediee/typologies-immobilisation';

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.cfgTypologiesImmobilisation.item);

  const [formData, setFormData] = useState<TypologieImmobilisationRequest>({
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
    immobilisationConcernee: '',
    compteComptable: '',
    compteAmortissement: '',
    compteDotation: '',
    taux: null,
    duree: null,
  });

  useEffect(() => {
    if (id) {
      dispatch(getTypologieImmobilisationById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        immobilisationConcernee: item.immobilisationConcernee ?? '',
        compteComptable: item.compteComptable ?? '',
        compteAmortissement: item.compteAmortissement ?? '',
        compteDotation: item.compteDotation ?? '',
        taux: item.taux ?? null,
        duree: item.duree ?? null,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof TypologieImmobilisationRequest>(
    field: T,
    value: TypologieImmobilisationRequest[T],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  const validate = (data: TypologieImmobilisationRequest) => {
    try {
      TypologieImmobilisationRequestSchema.parse(data);
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
      await dispatch(
        editTypologieImmobilisation({ id: item.numero, updatedItem: formData }),
      ).unwrap();
      dispatch(resetTypologieImmobilisation());
    } else {
      await dispatch(createTypologieImmobilisation(formData)).unwrap();
    }

    navigate(backPath);
  };

  const confirmDelete = () => {
    if (item) {
      dispatch(deleteTypologieImmobilisation(item.numero));
      dispatch(resetTypologieImmobilisation());
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
                ? `Détails "${formData.immobilisationConcernee}"`
                : item
                ? `Modifier "${formData.immobilisationConcernee}"`
                : "Ajouter une typologie d'immobilisation"
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
              <h3 className='text-base font-semibold text-gray-900'>Informations</h3>
            </div>

            <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 [&_input:not([type=checkbox])]:w-full [&_[role=combobox]]:w-full [&_textarea]:w-full'>
              <div className='space-y-2'>
                <Label htmlFor='immobilisationConcernee' className='text-sm font-medium'>
                  Immoblisation Concernées
                </Label>
                <Input
                  id='immobilisationConcernee'
                  value={formData.immobilisationConcernee}
                  onChange={(e) => handleChange('immobilisationConcernee', e.target.value)}
                  disabled={changeToDetails}
                  className={errors.immobilisationConcernee ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.immobilisationConcernee && (
                  <p className='text-red-600 text-sm'>{errors.immobilisationConcernee}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='compteComptable' className='text-sm font-medium'>
                  Compte Comptable
                </Label>
                <Input
                  id='compteComptable'
                  value={formData.compteComptable ?? ''}
                  onChange={(e) => handleChange('compteComptable', e.target.value)}
                  disabled={changeToDetails}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='compteAmortissement' className='text-sm font-medium'>
                  Compte amortissement
                </Label>
                <Input
                  id='compteAmortissement'
                  value={formData.compteAmortissement ?? ''}
                  onChange={(e) => handleChange('compteAmortissement', e.target.value)}
                  disabled={changeToDetails}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='compteDotation' className='text-sm font-medium'>
                  Compte Dotation
                </Label>
                <Input
                  id='compteDotation'
                  value={formData.compteDotation ?? ''}
                  onChange={(e) => handleChange('compteDotation', e.target.value)}
                  disabled={changeToDetails}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='taux' className='text-sm font-medium'>
                  Taux
                </Label>
                <Input
                  id='taux'
                  type='number'
                  step='0.01'
                  value={formData.taux ?? ''}
                  onChange={(e) => handleChange('taux', numOrNull(e.target.value))}
                  disabled={changeToDetails}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='duree' className='text-sm font-medium'>
                  Durée
                </Label>
                <Input
                  id='duree'
                  type='number'
                  value={formData.duree ?? ''}
                  onChange={(e) => handleChange('duree', numOrNull(e.target.value))}
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
        description={`Êtes-vous sûr de vouloir supprimer "${formData.immobilisationConcernee}" ?`}
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
