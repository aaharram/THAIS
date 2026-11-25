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
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/title';
import { AppDispatch, RootState } from '@/store';
import {
  DESTINATIONS_PROSPECTION,
  NATURES_OFFRE,
  ProspectionRequest,
  ProspectionRequestSchema,
  STATUTS_PROSPECTION,
} from '@/store/features/commercialisation/prospection-schemas';
import {
  createProspection,
  editProspection,
  getProspectionById,
  resetProspection,
} from '@/store/features/commercialisation/prospectionsSlice';
import { useAppSelector } from '@/store/hooks';
import { FileText, Info, Search, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/commercialisation/prospection';

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

const emptyForm: ProspectionRequest = {
  description: '',
  typologie: null,
  typeOperation: 0,
  situationProspection: 0,
  dateAjout: '',
  dateAdjudication: '',
  dateContrat: '',
  notes: '',
  pv: '',
  avisBPP: '',
  avisDPAL: '',
  supportCA: '',
  businesPlan: '',
  inactif: false,
};

type PjKey = 'pv' | 'avisBPP' | 'avisDPAL' | 'supportCA' | 'businesPlan';

const PJ_FIELDS: { key: PjKey; label: string }[] = [
  { key: 'pv', label: 'PV' },
  { key: 'avisBPP', label: 'Avis de la BPP' },
  { key: 'avisDPAL', label: 'Avis de la DPAL' },
  { key: 'supportCA', label: 'Support du Comité Administratif' },
  { key: 'businesPlan', label: 'Business Plan' },
];

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const item = useAppSelector((state: RootState) => state.prospections.item);

  const [formData, setFormData] = useState<ProspectionRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    if (id) {
      dispatch(getProspectionById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        description: item.description ?? '',
        typologie: item.typologie ?? null,
        typeOperation: item.typeOperation ?? 0,
        situationProspection: item.situationProspection ?? 0,
        dateAjout: item.dateAjout ? item.dateAjout.substring(0, 10) : '',
        dateAdjudication: item.dateAdjudication ? item.dateAdjudication.substring(0, 10) : '',
        dateContrat: item.dateContrat ? item.dateContrat.substring(0, 10) : '',
        notes: item.notes ?? '',
        pv: item.pv ?? '',
        avisBPP: item.avisBPP ?? '',
        avisDPAL: item.avisDPAL ?? '',
        supportCA: item.supportCA ?? '',
        businesPlan: item.businesPlan ?? '',
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof ProspectionRequest>(field: T, value: ProspectionRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: ProspectionRequest) => {
    try {
      ProspectionRequestSchema.parse(data);
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
      await dispatch(editProspection({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetProspection());
    } else {
      await dispatch(createProspection(formData)).unwrap();
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
                ? `Détails prospection — ${item?.description ?? ''}`
                : item
                ? `Modifier prospection — ${item.description ?? ''}`
                : 'Ajouter une prospection'
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
          <Section icon={Search} title='Informations'>
            <div className='space-y-2'>
              <Label htmlFor='description' className='text-sm font-medium'>
                Zone
              </Label>
              <Input
                id='description'
                value={formData.description ?? ''}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='typologie' className='text-sm font-medium'>
                Destination
              </Label>
              <Select
                value={formData.typologie?.toString() || '0'}
                onValueChange={(value) => handleChange('typologie', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='typologie'>
                  <SelectValue placeholder='-' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>-</SelectItem>
                  {DESTINATIONS_PROSPECTION.map((d) => (
                    <SelectItem key={d.value} value={d.value.toString()}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dateAjout' className='text-sm font-medium'>
                Date d&apos;ajout
              </Label>
              <Input
                id='dateAjout'
                type='date'
                value={formData.dateAjout ?? ''}
                onChange={(e) => handleChange('dateAjout', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dateAdjudication' className='text-sm font-medium'>
                Date d&apos;accord de la BPP
              </Label>
              <Input
                id='dateAdjudication'
                type='date'
                value={formData.dateAdjudication ?? ''}
                onChange={(e) => handleChange('dateAdjudication', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dateContrat' className='text-sm font-medium'>
                Date Contrat
              </Label>
              <Input
                id='dateContrat'
                type='date'
                value={formData.dateContrat ?? ''}
                onChange={(e) => handleChange('dateContrat', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='typeOperation' className='text-sm font-medium'>
                Nature de l&apos;offre
              </Label>
              <Select
                value={(formData.typeOperation ?? 0).toString()}
                onValueChange={(value) => handleChange('typeOperation', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='typeOperation'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NATURES_OFFRE.map((n) => (
                    <SelectItem key={n.value} value={n.value.toString()}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='situationProspection' className='text-sm font-medium'>
                Statut
              </Label>
              <Select
                value={(formData.situationProspection ?? 0).toString()}
                onValueChange={(value) => handleChange('situationProspection', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='situationProspection'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS_PROSPECTION.map((s) => (
                    <SelectItem key={s.value} value={s.value.toString()}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2 col-span-full'>
              <Label htmlFor='notes' className='text-sm font-medium'>
                Commentaire
              </Label>
              <Textarea
                id='notes'
                rows={4}
                value={formData.notes ?? ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
          </Section>

          <Section icon={FileText} title='Pièces Jointes'>
            {PJ_FIELDS.map(({ key, label }) => (
              <div className='space-y-2' key={key}>
                <Label htmlFor={key} className='text-sm font-medium'>
                  {label}
                </Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id={key}
                    readOnly
                    value={formData[key] ?? ''}
                    placeholder='Aucun fichier sélectionné'
                    className='bg-gray-50 text-gray-500'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    disabled={changeToDetails}
                    onClick={() => fileInputRefs.current[key]?.click()}
                  >
                    Parcourir
                  </Button>
                  <input
                    type='file'
                    ref={(el) => {
                      fileInputRefs.current[key] = el;
                    }}
                    className='hidden'
                    onChange={(e) => handleChange(key, e.target.files?.[0]?.name ?? '')}
                  />
                </div>
              </div>
            ))}
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
