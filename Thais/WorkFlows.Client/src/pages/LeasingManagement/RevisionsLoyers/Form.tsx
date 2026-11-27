import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/title';
import { AppDispatch } from '@/store';
import { getBailById } from '@/store/features/leasing/bauxSlice';
import { RevisionLoyerRequest, RevisionLoyerRequestSchema } from '@/store/features/leasing/revision-loyer-schemas';
import { createRevisionLoyer, resetRevisionLoyer } from '@/store/features/leasing/revisionsLoyerSlice';
import { useAppSelector } from '@/store/hooks';
import { TrendingUp, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

const backPath = '/leasing-management/revisions-loyers';

// RMANew (AvisRetard1/2, MiseEnDemeure) : 8% pour un usage HABITATION, 10% sinon.
const tauxParUsage = (usage?: string | null) =>
  (usage ?? '').trim().toUpperCase() === 'HABITATION' ? 8 : 10;

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
    return () => {
      dispatch(resetRevisionLoyer());
    };
  }, [noLocation, dispatch]);

  const ancienLoyerDefaut = bail?.montant ?? bail?.loyerNet ?? 0;
  const tauxDefaut = useMemo(() => tauxParUsage(bail?.usage), [bail?.usage]);
  const nouveauLoyerDefaut = useMemo(
    () => Math.round((ancienLoyerDefaut + ancienLoyerDefaut * (tauxDefaut / 100)) * 100) / 100,
    [ancienLoyerDefaut, tauxDefaut],
  );

  const [formData, setFormData] = useState<RevisionLoyerRequest>({
    addUser: userId,
    noLocation,
    ancienLoyer: null,
    nouveauLoyer: null,
    tauxRevision: null,
    dateRevision: new Date().toISOString().substring(0, 10),
    dateProchaineRevision: '',
    reliquat: null,
    notes: '',
  });

  useEffect(() => {
    if (bail) {
      setFormData((prev) => ({ ...prev, noLocation, ancienLoyer: ancienLoyerDefaut, tauxRevision: tauxDefaut, nouveauLoyer: nouveauLoyerDefaut }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bail, noLocation]);

  const handleChange = <T extends keyof RevisionLoyerRequest>(field: T, value: RevisionLoyerRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  const validate = (data: RevisionLoyerRequest) => {
    try {
      RevisionLoyerRequestSchema.parse(data);
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

    await dispatch(createRevisionLoyer(formData)).unwrap();
    navigate(backPath);
  };

  const nomLocataire = bail?.nomLocataire ?? '';

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>
          <Title
            icon={TrendingUp}
            title={`Réviser le loyer — ${nomLocataire || bail?.numContratLocations || ''}`}
            description={bail ? `${bail.nomBuilding ?? ''} · ${bail.nomLocal ?? ''}` : undefined}
          />
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='rounded-lg border bg-sky-500/10/50 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm'>
            <div>
              <div className='text-muted-foreground'>Usage</div>
              <div className='font-semibold'>{bail?.usage || '-'}</div>
            </div>
            <div>
              <div className='text-muted-foreground'>Loyer actuel</div>
              <div className='font-semibold'>{ancienLoyerDefaut.toLocaleString('fr-FR')} MAD</div>
            </div>
            <div>
              <div className='text-muted-foreground'>Taux applicable</div>
              <div className='font-semibold'>{tauxDefaut}%</div>
            </div>
            <div>
              <div className='text-muted-foreground'>Loyer proposé</div>
              <div className='font-semibold text-sky-700 dark:text-sky-400'>{nouveauLoyerDefaut.toLocaleString('fr-FR')} MAD</div>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 [&_input:not([type=checkbox])]:w-full [&_[role=combobox]]:w-full [&_textarea]:w-full'>
            <div className='space-y-2'>
              <Label htmlFor='ancienLoyer' className='text-sm font-medium'>
                Ancien loyer
              </Label>
              <Input
                id='ancienLoyer'
                type='number'
                step='0.01'
                value={formData.ancienLoyer ?? ''}
                onChange={(e) => handleChange('ancienLoyer', numOrNull(e.target.value))}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='tauxRevision' className='text-sm font-medium'>
                Taux de révision (%)
              </Label>
              <Input
                id='tauxRevision'
                type='number'
                step='0.01'
                value={formData.tauxRevision ?? ''}
                onChange={(e) => handleChange('tauxRevision', numOrNull(e.target.value))}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='nouveauLoyer' className='text-sm font-medium'>
                Nouveau loyer
              </Label>
              <Input
                id='nouveauLoyer'
                type='number'
                step='0.01'
                value={formData.nouveauLoyer ?? ''}
                onChange={(e) => handleChange('nouveauLoyer', numOrNull(e.target.value))}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='reliquat' className='text-sm font-medium'>
                Reliquat
              </Label>
              <Input
                id='reliquat'
                type='number'
                step='0.01'
                value={formData.reliquat ?? ''}
                onChange={(e) => handleChange('reliquat', numOrNull(e.target.value))}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dateRevision' className='text-sm font-medium'>
                Date de révision
              </Label>
              <Input
                id='dateRevision'
                type='date'
                value={formData.dateRevision ?? ''}
                onChange={(e) => handleChange('dateRevision', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dateProchaineRevision' className='text-sm font-medium'>
                Prochaine échéance
              </Label>
              <Input
                id='dateProchaineRevision'
                type='date'
                placeholder='Calculée automatiquement (+3 ans) si vide'
                value={formData.dateProchaineRevision ?? ''}
                onChange={(e) => handleChange('dateProchaineRevision', e.target.value)}
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
          {errors.noLocation && <p className='text-red-600 text-sm'>{errors.noLocation}</p>}
        </form>
      </CardContent>
      <Separator />
      <CardFooter className='flex justify-end gap-2 mt-6'>
        <Button variant='outline'
          className='border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary' onClick={() => navigate(backPath)}>
          <ArrowLeft />
          Retour
        </Button>
        <Button onClick={handleSubmit}><Save />Enregistrer la révision</Button>
      </CardFooter>
    </Card>
  );
};

export default Form;
