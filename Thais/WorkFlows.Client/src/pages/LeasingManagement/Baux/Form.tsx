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
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/title';
import { AppDispatch, RootState } from '@/store';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import {
  BailRequest,
  BailRequestSchema,
  ETATS_BAIL,
  MODES_REGLEMENT,
} from '@/store/features/leasing/bail-schemas';
import { createBail, editBail, getBailById, resetBail } from '@/store/features/leasing/bauxSlice';
import { getAllLocataires } from '@/store/features/leasing/locatairesSlice';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { getAllLocaux } from '@/store/features/patrimoine/locauxSlice';
import { useAppSelector } from '@/store/hooks';
import { DollarSign, FileSignature, Info, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { z } from 'zod';

const backPath = '/leasing-management/baux';

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

const emptyForm: BailRequest = {
  numContratLocations: '',
  noBuilding: 0,
  noLocal: 0,
  noLocataire: 0,
  noEncaisseur: null,
  noPeriodicity: null,
  usage: '',
  dateDebut: '',
  dateGestion: '',
  dateFin: '',
  franchise: null,
  loyerNet: null,
  charges: null,
  tva: null,
  taxe: null,
  loyerGarage: null,
  autres: null,
  genererQuittance: false,
  garantie: null,
  caution: null,
  modeReglement: '',
  etat: 'En cours de location',
  notes: '',
  inactif: false,
};

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.baux.item);
  const { allItems: buildings } = useAppSelector((state) => state.buildings);
  const { allItems: locaux } = useAppSelector((state) => state.locaux);
  const { allItems: locataires } = useAppSelector((state) => state.locataires);
  const { allItems: encaisseurs } = useAppSelector((state) => state.cfgEncaisseurs);
  const { allItems: periodicites } = useAppSelector((state) => state.cfgPeriodicites);

  const preselectedBuilding = Number(searchParams.get('building')) || 0;

  const [formData, setFormData] = useState<BailRequest>({
    ...emptyForm,
    noBuilding: preselectedBuilding,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 100 }));
    dispatch(getAllLocataires({ pageNumber: 1, pageSize: 100 }));
    dispatch(lookupModules.cfgEncaisseurs.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgPeriodicites.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getBailById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (formData.noBuilding) {
      dispatch(getAllLocaux({ pageNumber: 1, pageSize: 100, filters: { NoBuilding: [formData.noBuilding] } }));
    }
  }, [formData.noBuilding, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        numContratLocations: item.numContratLocations ?? '',
        noBuilding: item.noBuilding,
        noLocal: item.noLocal,
        noLocataire: item.noLocataire,
        noEncaisseur: item.noEncaisseur ?? null,
        noPeriodicity: item.noPeriodicity ?? null,
        usage: item.usage ?? '',
        dateDebut: item.dateDebut ? item.dateDebut.substring(0, 10) : '',
        dateGestion: item.dateGestion ? item.dateGestion.substring(0, 10) : '',
        dateFin: item.dateFin ? item.dateFin.substring(0, 10) : '',
        franchise: item.franchise ?? null,
        loyerNet: item.loyerNet ?? null,
        charges: item.charges ?? null,
        tva: item.tva ?? null,
        taxe: item.taxe ?? null,
        loyerGarage: item.loyerGarage ?? null,
        autres: item.autres ?? null,
        genererQuittance: item.genererQuittance,
        garantie: item.garantie ?? null,
        caution: item.caution ?? null,
        modeReglement: item.modeReglement ?? '',
        etat: item.etat,
        notes: item.notes ?? '',
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof BailRequest>(field: T, value: BailRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  const validate = (data: BailRequest) => {
    try {
      BailRequestSchema.parse(data);
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
      await dispatch(editBail({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetBail());
    } else {
      await dispatch(createBail(formData)).unwrap();
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
                ? `Détails bail — ${item?.nomLocataire ?? ''}`
                : item
                ? `Modifier bail — ${item.nomLocataire ?? ''}`
                : 'Ajouter un bail'
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
        <form onSubmit={handleSubmit} className='space-y-6'>
          <Section icon={FileSignature} title='Informations'>
            <div className='space-y-2'>
              <Label htmlFor='numContratLocations' className='text-sm font-medium'>
                Contrat
              </Label>
              <Input
                id='numContratLocations'
                value={formData.numContratLocations ?? ''}
                onChange={(e) => handleChange('numContratLocations', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noBuilding' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Actif
              </Label>
              <Select
                value={formData.noBuilding ? formData.noBuilding.toString() : ''}
                onValueChange={(value) => {
                  handleChange('noBuilding', Number(value));
                  handleChange('noLocal', 0);
                }}
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
              <Label htmlFor='noLocal' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Local
              </Label>
              <Select
                value={formData.noLocal ? formData.noLocal.toString() : ''}
                onValueChange={(value) => handleChange('noLocal', Number(value))}
                disabled={changeToDetails || !formData.noBuilding}
              >
                <SelectTrigger id='noLocal' className={errors.noLocal ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Choisir un local' />
                </SelectTrigger>
                <SelectContent>
                  {locaux.map((l) => (
                    <SelectItem key={l.numero} value={l.numero.toString()}>
                      {l.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.noLocal && <p className='text-red-600 text-sm'>{errors.noLocal}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noLocataire' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Locataire
              </Label>
              <Select
                value={formData.noLocataire ? formData.noLocataire.toString() : ''}
                onValueChange={(value) => handleChange('noLocataire', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noLocataire' className={errors.noLocataire ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {locataires.map((l) => (
                    <SelectItem key={l.numero} value={l.numero.toString()}>
                      {l.nomAffiche}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.noLocataire && <p className='text-red-600 text-sm'>{errors.noLocataire}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noEncaisseur' className='text-sm font-medium'>
                Encaisseur
              </Label>
              <Select
                value={formData.noEncaisseur?.toString() || '0'}
                onValueChange={(value) => handleChange('noEncaisseur', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noEncaisseur'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucun</SelectItem>
                  {encaisseurs.map((e) => (
                    <SelectItem key={e.numero} value={e.numero.toString()}>
                      {e.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='usage' className='text-sm font-medium'>
                Usage
              </Label>
              <Input
                id='usage'
                value={formData.usage ?? ''}
                onChange={(e) => handleChange('usage', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noPeriodicity' className='text-sm font-medium'>
                Périodicité
              </Label>
              <Select
                value={formData.noPeriodicity?.toString() || '0'}
                onValueChange={(value) => handleChange('noPeriodicity', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noPeriodicity'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucune</SelectItem>
                  {periodicites.map((p) => (
                    <SelectItem key={p.numero} value={p.numero.toString()}>
                      {p.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
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

            <div className='space-y-2'>
              <Label htmlFor='dateGestion' className='text-sm font-medium'>
                Date gestion
              </Label>
              <Input
                id='dateGestion'
                type='date'
                value={formData.dateGestion ?? ''}
                onChange={(e) => handleChange('dateGestion', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
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

            <div className='space-y-2'>
              <Label htmlFor='franchise' className='text-sm font-medium'>
                Franchise (mois)
              </Label>
              <Input
                id='franchise'
                type='number'
                value={formData.franchise ?? ''}
                onChange={(e) => handleChange('franchise', numOrNull(e.target.value) as number | null)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='etat' className='text-sm font-medium'>
                Etat
              </Label>
              <Select
                value={formData.etat}
                onValueChange={(value) => handleChange('etat', value)}
                disabled={changeToDetails}
              >
                <SelectTrigger id='etat'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ETATS_BAIL.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                disabled={changeToDetails}
              />
            </div>
          </Section>

          <Section icon={DollarSign} title='Loyer & garanties'>
            <div className='space-y-2'>
              <Label htmlFor='loyerNet' className='text-sm font-medium'>
                Loyer net
              </Label>
              <Input
                id='loyerNet'
                type='number'
                step='0.01'
                value={formData.loyerNet ?? ''}
                onChange={(e) => handleChange('loyerNet', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='charges' className='text-sm font-medium'>
                Charges
              </Label>
              <Input
                id='charges'
                type='number'
                step='0.01'
                value={formData.charges ?? ''}
                onChange={(e) => handleChange('charges', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='tva' className='text-sm font-medium'>
                TVA
              </Label>
              <Input
                id='tva'
                type='number'
                step='0.01'
                value={formData.tva ?? ''}
                onChange={(e) => handleChange('tva', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='taxe' className='text-sm font-medium'>
                Taxe
              </Label>
              <Input
                id='taxe'
                type='number'
                step='0.01'
                value={formData.taxe ?? ''}
                onChange={(e) => handleChange('taxe', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='loyerGarage' className='text-sm font-medium'>
                Loyer garage
              </Label>
              <Input
                id='loyerGarage'
                type='number'
                step='0.01'
                value={formData.loyerGarage ?? ''}
                onChange={(e) => handleChange('loyerGarage', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='autres' className='text-sm font-medium'>
                Autres
              </Label>
              <Input
                id='autres'
                type='number'
                step='0.01'
                value={formData.autres ?? ''}
                onChange={(e) => handleChange('autres', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Loyer total</Label>
              <Input value={item?.montant ?? '-'} readOnly disabled className='bg-gray-50' />
            </div>

            <div className='flex items-center gap-2 pt-6'>
              <Checkbox
                id='genererQuittance'
                checked={formData.genererQuittance}
                onCheckedChange={(c) => handleChange('genererQuittance', c === true)}
                disabled={changeToDetails}
              />
              <Label htmlFor='genererQuittance'>Générer quittance</Label>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='garantie' className='text-sm font-medium'>
                Garantie
              </Label>
              <Input
                id='garantie'
                type='number'
                step='0.01'
                value={formData.garantie ?? ''}
                onChange={(e) => handleChange('garantie', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='caution' className='text-sm font-medium'>
                Caution
              </Label>
              <Input
                id='caution'
                type='number'
                step='0.01'
                value={formData.caution ?? ''}
                onChange={(e) => handleChange('caution', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
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
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {MODES_REGLEMENT.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
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
