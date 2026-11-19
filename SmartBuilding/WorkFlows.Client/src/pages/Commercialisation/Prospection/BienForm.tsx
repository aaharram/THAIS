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
import { Textarea } from '@/components/ui/textarea';
import { Title } from '@/components/ui/title';
import { AppDispatch, RootState } from '@/store';
import {
  AgenceImmobiliereRequest,
  AgenceImmobiliereRequestSchema,
} from '@/store/features/commercialisation/agence-immobiliere-schemas';
import {
  createAgenceImmobiliere,
  getAllAgencesImmobilieres,
} from '@/store/features/commercialisation/agencesImmobilieresSlice';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import {
  BuildingRequest,
  BuildingRequestSchema,
  NOMBRES_ETAGES,
  SORTS_PROSPECT,
  STATUTS_EXPERTISE_TECHNIQUE,
} from '@/store/features/patrimoine/building-schemas';
import { createBuilding, editBuilding, getBuildingById } from '@/store/features/patrimoine/buildingsSlice';
import { useAppSelector } from '@/store/hooks';
import { Building2, FileText, Home, Info, MapPin, Plus, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { z } from 'zod';

const Section = ({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: typeof Info;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className='border rounded-lg overflow-hidden'>
    <div className='bg-gray-50 px-4 py-3 flex items-center justify-between gap-2 border-b'>
      <div className='flex items-center gap-2'>
        <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
          <Icon className='h-4 w-4' />
        </div>
        <h3 className='text-base font-semibold text-gray-900'>{title}</h3>
      </div>
      {action}
    </div>
    <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4'>{children}</div>
  </div>
);

const emptyForm: BuildingRequest = {
  codeImmeuble: '',
  designation: '',
  enExploitation: false,
  noArticle: '',
  noBuildingType: null,
  compteGeneral: '',
  nAffectation: 'N.A',
  noEncaisseur: null,
  provenanceActif: null,
  ajouterContrainte: false,
  noProprieteType: 'Bien',
  noProprietaire: null,
  responsable: '',
  contactResponsable: '',
  noProspection: null,
  titreFoncier: '',
  typeTF: null,
  aVendre: false,
  notes: '',
  address1: '',
  postalCode: '',
  noCity: null,
  noCountry: 1,
  latitude: null,
  longitude: null,
  valeurEntreeTerrain: null,
  valeurEntreeConstruction: null,
  valeurAmenagement: null,
  dateAcquisition: '',
  dateModificationValeur: '',
  unitCode: '',
  surfaceTerrain: null,
  surfaceUtile: null,
  surfaceEspaceVert: null,
  surfaceParking: null,
  nombrePlacesParking: null,
  nombreAscenseurs: null,
  marqueAscenseur: '',
  nombreEtages: 0,
  accueil: false,
  securite: false,
  revetement: false,
  peinture: false,
  fauxPlafond: false,
  reseaux: false,
  climatisation: false,
  inactif: false,
  noAgenceImmobiliere: null,
  proprietaire: '',
  contactProprietaire: '',
  statusProspect: 0,
  statusExpertiseTechnique: 0,
  dateExpertiseTechnique: '',
  dateDemandeExpertiseTechnique: '',
  pjExpertiseTechnique: '',
  buildingImage: '',
  buildingPlan: '',
  superficieRDC: null,
  superficieSS: null,
  superficieSP: null,
  superficie1erEtage: null,
  superficie2emeEtage: null,
  superficie3emeEtage: null,
  superficie4emeEtage: null,
  superficie5emeEtage: null,
  superficie6emeEtage: null,
  superficie7emeEtage: null,
  superficie8emeEtage: null,
  superficie9emeEtage: null,
  superficie10emeEtage: null,
  superficie11emeEtage: null,
  superficie12emeEtage: null,
  superficie13emeEtage: null,
  superficie14emeEtage: null,
  superficie15emeEtage: null,
  superficie16emeEtage: null,
  superficie17emeEtage: null,
  superficie18emeEtage: null,
  superficie19emeEtage: null,
  superficie20emeEtage: null,
  superficie21emeEtage: null,
  superficie22emeEtage: null,
  superficie23emeEtage: null,
  superficie24emeEtage: null,
  superficie25emeEtage: null,
  facadePrincipale: null,
  facadeArriere: null,
  facadeLateraleDroite: null,
  facadeLateraleGauche: null,
  facadeEnBiais: null,
  nbFacade: null,
};

const FLOOR_FIELDS = [
  'superficie1erEtage',
  'superficie2emeEtage',
  'superficie3emeEtage',
  'superficie4emeEtage',
  'superficie5emeEtage',
  'superficie6emeEtage',
  'superficie7emeEtage',
  'superficie8emeEtage',
  'superficie9emeEtage',
  'superficie10emeEtage',
  'superficie11emeEtage',
  'superficie12emeEtage',
  'superficie13emeEtage',
  'superficie14emeEtage',
  'superficie15emeEtage',
  'superficie16emeEtage',
  'superficie17emeEtage',
  'superficie18emeEtage',
  'superficie19emeEtage',
  'superficie20emeEtage',
  'superficie21emeEtage',
  'superficie22emeEtage',
  'superficie23emeEtage',
  'superficie24emeEtage',
  'superficie25emeEtage',
] as const satisfies readonly (keyof BuildingRequest)[];

const FLOOR_LABELS = [
  '1er Etage', '2ème Etage', '3ème Etage', '4ème Etage', '5ème Etage',
  '6ème Etage', '7ème Etage', '8ème Etage', '9ème Etage', '10ème Etage',
  '11ème Etage', '12ème Etage', '13ème Etage', '14ème Etage', '15ème Etage',
  '16ème Etage', '17ème Etage', '18ème Etage', '19ème Etage', '20ème Etage',
  '21ème Etage', '22ème Etage', '23ème Etage', '24ème Etage', '25ème Etage',
];

const emptyAgenceForm: AgenceImmobiliereRequest = {
  raisonSocial: '',
  adresse: '',
  email: '',
  tele: '',
  contactPrincipal: '',
  teleContactPrincipal: '',
  inactif: false,
};

const BienForm = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const prospectionId = Number(searchParams.get('prospection')) || null;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [agenceDialogOpen, setAgenceDialogOpen] = useState(false);
  const [agenceForm, setAgenceForm] = useState<AgenceImmobiliereRequest>(emptyAgenceForm);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [autreFichier, setAutreFichier] = useState<File | null>(null);
  const [autresDocuments, setAutresDocuments] = useState<string[]>([]);
  const autreFichierInputRef = useRef<HTMLInputElement | null>(null);

  const item = useAppSelector((state: RootState) => state.buildings.item);
  const { allItems: buildingTypes } = useAppSelector((state) => state.cfgBuildingTypes);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const { allItems: villes } = useAppSelector((state) => state.cfgVilles);
  const { allItems: paysList } = useAppSelector((state) => state.cfgPays);
  const { allItems: agences } = useAppSelector((state) => state.agencesImmobilieres);

  const [formData, setFormData] = useState<BuildingRequest>({
    ...emptyForm,
    noProspection: item ? emptyForm.noProspection : prospectionId,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(lookupModules.cfgBuildingTypes.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgVilles.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgPays.getAll({ pageSize: 1000 }));
    dispatch(getAllAgencesImmobilieres({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getBuildingById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData((prev) => ({
        ...prev,
        addUser: item.addUser ?? undefined,
        modUser: userId,
        codeImmeuble: item.codeImmeuble,
        designation: item.designation,
        noBuildingType: item.noBuildingType ?? null,
        noProprietaire: item.noProprietaire ?? null,
        noProspection: item.noProspection ?? null,
        titreFoncier: item.titreFoncier ?? '',
        notes: item.notes ?? '',
        address1: item.address1 ?? '',
        noCity: item.noCity ?? null,
        noCountry: item.noCountry ?? null,
        latitude: item.latitude ?? null,
        longitude: item.longitude ?? null,
        unitCode: item.unitCode ?? '',
        surfaceTerrain: item.surfaceTerrain ?? null,
        nombrePlacesParking: item.nombrePlacesParking ?? null,
        nombreEtages: item.nombreEtages ?? 0,
        noAgenceImmobiliere: item.noAgenceImmobiliere ?? null,
        proprietaire: item.proprietaire ?? '',
        contactProprietaire: item.contactProprietaire ?? '',
        statusProspect: item.statusProspect ?? 0,
        statusExpertiseTechnique: item.statusExpertiseTechnique ?? 0,
        dateExpertiseTechnique: item.dateExpertiseTechnique ? item.dateExpertiseTechnique.substring(0, 10) : '',
        dateDemandeExpertiseTechnique: item.dateDemandeExpertiseTechnique
          ? item.dateDemandeExpertiseTechnique.substring(0, 10)
          : '',
        pjExpertiseTechnique: item.pjExpertiseTechnique ?? '',
        buildingImage: item.buildingImage ?? '',
        buildingPlan: item.buildingPlan ?? '',
        superficieRDC: item.superficieRDC ?? null,
        superficieSS: item.superficieSS ?? null,
        superficieSP: item.superficieSP ?? null,
        superficie1erEtage: item.superficie1erEtage ?? null,
        superficie2emeEtage: item.superficie2emeEtage ?? null,
        superficie3emeEtage: item.superficie3emeEtage ?? null,
        superficie4emeEtage: item.superficie4emeEtage ?? null,
        superficie5emeEtage: item.superficie5emeEtage ?? null,
        superficie6emeEtage: item.superficie6emeEtage ?? null,
        superficie7emeEtage: item.superficie7emeEtage ?? null,
        superficie8emeEtage: item.superficie8emeEtage ?? null,
        superficie9emeEtage: item.superficie9emeEtage ?? null,
        superficie10emeEtage: item.superficie10emeEtage ?? null,
        superficie11emeEtage: item.superficie11emeEtage ?? null,
        superficie12emeEtage: item.superficie12emeEtage ?? null,
        superficie13emeEtage: item.superficie13emeEtage ?? null,
        superficie14emeEtage: item.superficie14emeEtage ?? null,
        superficie15emeEtage: item.superficie15emeEtage ?? null,
        superficie16emeEtage: item.superficie16emeEtage ?? null,
        superficie17emeEtage: item.superficie17emeEtage ?? null,
        superficie18emeEtage: item.superficie18emeEtage ?? null,
        superficie19emeEtage: item.superficie19emeEtage ?? null,
        superficie20emeEtage: item.superficie20emeEtage ?? null,
        superficie21emeEtage: item.superficie21emeEtage ?? null,
        superficie22emeEtage: item.superficie22emeEtage ?? null,
        superficie23emeEtage: item.superficie23emeEtage ?? null,
        superficie24emeEtage: item.superficie24emeEtage ?? null,
        superficie25emeEtage: item.superficie25emeEtage ?? null,
        facadePrincipale: item.facadePrincipale ?? null,
        facadeArriere: item.facadeArriere ?? null,
        facadeLateraleDroite: item.facadeLateraleDroite ?? null,
        facadeLateraleGauche: item.facadeLateraleGauche ?? null,
        facadeEnBiais: item.facadeEnBiais ?? null,
        nbFacade: item.nbFacade ?? null,
      }));
    }
  }, [item, userId]);

  const handleChange = <T extends keyof BuildingRequest>(field: T, value: BuildingRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  const backPath = prospectionId
    ? `/commercialisation/prospection?prospection=${prospectionId}`
    : '/commercialisation/prospection';

  const validate = (data: BuildingRequest) => {
    try {
      BuildingRequestSchema.parse(data);
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
    const payload: BuildingRequest = {
      ...formData,
      codeImmeuble: formData.codeImmeuble || `BIEN-${Date.now()}`,
      nAffectation: formData.nAffectation || 'N.A',
    };
    if (!validate(payload)) return;

    if (item) {
      await dispatch(editBuilding({ id: item.numero, updatedItem: payload })).unwrap();
    } else {
      await dispatch(createBuilding(payload)).unwrap();
    }

    navigate(prospectionId ? `/commercialisation/prospection?prospection=${prospectionId}` : '/patrimoine/actifs');
  };

  const handleAgenceSubmit = async () => {
    try {
      AgenceImmobiliereRequestSchema.parse(agenceForm);
    } catch {
      return;
    }
    const created = await dispatch(createAgenceImmobiliere(agenceForm)).unwrap();
    dispatch(getAllAgencesImmobilieres({ pageSize: 1000 }));
    handleChange('noAgenceImmobiliere', created.numero);
    setAgenceDialogOpen(false);
    setAgenceForm(emptyAgenceForm);
  };

  const nbEtagesAffiches = formData.nombreEtages ?? 0;

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>
          <Title title={item ? `Modifier "${item.designation}"` : 'Ajouter un bien'} />
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
          <Section icon={Building2} title='Actif'>
            <div className='space-y-2'>
              <Label htmlFor='noAgenceImmobiliere' className='text-sm font-medium'>
                Agence Immobilière
              </Label>
              <Select
                value={formData.noAgenceImmobiliere?.toString() || '0'}
                onValueChange={(value) => handleChange('noAgenceImmobiliere', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noAgenceImmobiliere'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucune</SelectItem>
                  {agences.map((a) => (
                    <SelectItem key={a.numero} value={a.numero.toString()}>
                      {a.raisonSocial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type='button'
                onClick={() => setAgenceDialogOpen(true)}
                className='text-sm text-primary hover:underline inline-flex items-center gap-1'
              >
                <Plus className='h-3.5 w-3.5' /> Ajouter une Agence Immobilière
              </button>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='designation' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Désignation
              </Label>
              <Input
                id='designation'
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                disabled={changeToDetails}
                className={errors.designation ? 'border-red-300' : ''}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noBuildingType' className='text-sm font-medium'>
                Destination
              </Label>
              <Select
                value={formData.noBuildingType?.toString() || '0'}
                onValueChange={(value) => handleChange('noBuildingType', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noBuildingType'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucune</SelectItem>
                  {buildingTypes.map((b) => (
                    <SelectItem key={b.numero} value={b.numero.toString()}>
                      {b.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noProprietaire' className='text-sm font-medium'>
                Direction Réseau
              </Label>
              <Select
                value={formData.noProprietaire?.toString() || '0'}
                onValueChange={(value) => handleChange('noProprietaire', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noProprietaire'>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Aucune</SelectItem>
                  {proprietaires.map((p) => (
                    <SelectItem key={p.numero} value={p.numero.toString()}>
                      {p.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='proprietaire' className='text-sm font-medium'>
                Proprietaire
              </Label>
              <Input
                id='proprietaire'
                value={formData.proprietaire ?? ''}
                onChange={(e) => handleChange('proprietaire', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='contactProprietaire' className='text-sm font-medium'>
                Contact Proprietaire
              </Label>
              <Input
                id='contactProprietaire'
                value={formData.contactProprietaire ?? ''}
                onChange={(e) => handleChange('contactProprietaire', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address1' className='text-sm font-medium'>
                Adresse
              </Label>
              <Input
                id='address1'
                value={formData.address1 ?? ''}
                onChange={(e) => handleChange('address1', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noCity' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Ville
              </Label>
              <Select
                value={formData.noCity?.toString() || '0'}
                onValueChange={(value) => handleChange('noCity', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noCity' className={errors.noCity ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {villes.map((v) => (
                    <SelectItem key={v.numero} value={v.numero.toString()}>
                      {v.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noCountry' className='text-sm font-medium'>
                <span className='text-red-500'>* </span>Pays
              </Label>
              <Select
                value={formData.noCountry?.toString() || '0'}
                onValueChange={(value) => handleChange('noCountry', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noCountry' className={errors.noCountry ? 'border-red-300' : ''}>
                  <SelectValue placeholder='Sélectionnez...' />
                </SelectTrigger>
                <SelectContent>
                  {paysList.map((p) => (
                    <SelectItem key={p.numero} value={p.numero.toString()}>
                      {p.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='titreFoncier' className='text-sm font-medium'>
                Titre foncier
              </Label>
              <Input
                id='titreFoncier'
                value={formData.titreFoncier ?? ''}
                onChange={(e) => handleChange('titreFoncier', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            {(
              [
                { key: 'buildingImage', label: 'Image' },
                { key: 'buildingPlan', label: 'Plan architecte' },
                { key: 'pjExpertiseTechnique', label: 'Expertise Technique' },
              ] as const
            ).map(({ key, label }) => (
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

            <div className='space-y-2'>
              <Label htmlFor='dateExpertiseTechnique' className='text-sm font-medium'>
                Date Expertise
              </Label>
              <Input
                id='dateExpertiseTechnique'
                type='date'
                value={formData.dateExpertiseTechnique ?? ''}
                onChange={(e) => handleChange('dateExpertiseTechnique', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dateDemandeExpertiseTechnique' className='text-sm font-medium'>
                Date Demande Expertise
              </Label>
              <Input
                id='dateDemandeExpertiseTechnique'
                type='date'
                value={formData.dateDemandeExpertiseTechnique ?? ''}
                onChange={(e) => handleChange('dateDemandeExpertiseTechnique', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='statusExpertiseTechnique' className='text-sm font-medium'>
                Status Expertise
              </Label>
              <Select
                value={(formData.statusExpertiseTechnique ?? 0).toString()}
                onValueChange={(value) => handleChange('statusExpertiseTechnique', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='statusExpertiseTechnique'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS_EXPERTISE_TECHNIQUE.map((s) => (
                    <SelectItem key={s.value} value={s.value.toString()}>
                      {s.label || '—'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='statusProspect' className='text-sm font-medium'>
                Sort
              </Label>
              <Select
                value={(formData.statusProspect ?? 0).toString()}
                onValueChange={(value) => handleChange('statusProspect', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='statusProspect'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS_PROSPECT.map((s) => (
                    <SelectItem key={s.value} value={s.value.toString()}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2 col-span-full'>
              <Label htmlFor='notes' className='text-sm font-medium'>
                Descriptif
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

          <Section icon={Home} title='Indicateurs'>
            <div className='space-y-2'>
              <Label htmlFor='unitCode' className='text-sm font-medium'>
                Code terrain
              </Label>
              <Input
                id='unitCode'
                value={formData.unitCode ?? ''}
                onChange={(e) => handleChange('unitCode', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='superficieRDC' className='text-sm font-medium'>
                Superficie RDC
              </Label>
              <Input
                id='superficieRDC'
                type='number'
                value={formData.superficieRDC ?? 0}
                onChange={(e) => handleChange('superficieRDC', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='superficieSS' className='text-sm font-medium'>
                Superficie sous sol
              </Label>
              <Input
                id='superficieSS'
                type='number'
                value={formData.superficieSS ?? 0}
                onChange={(e) => handleChange('superficieSS', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='superficieSP' className='text-sm font-medium'>
                Mezzanine
              </Label>
              <Input
                id='superficieSP'
                type='number'
                value={formData.superficieSP ?? 0}
                onChange={(e) => handleChange('superficieSP', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='nombreEtages' className='text-sm font-medium'>
                Nombre d&apos;étages
              </Label>
              <Select
                value={(formData.nombreEtages ?? 0).toString()}
                onValueChange={(value) => handleChange('nombreEtages', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='nombreEtages'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOMBRES_ETAGES.map((n) => (
                    <SelectItem key={n.value} value={n.value.toString()}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {FLOOR_FIELDS.slice(0, nbEtagesAffiches).map((key, i) => (
              <div className='space-y-2' key={key}>
                <Label htmlFor={key} className='text-sm font-medium'>
                  {FLOOR_LABELS[i]}
                </Label>
                <Input
                  id={key}
                  type='number'
                  value={formData[key] ?? 0}
                  onChange={(e) => handleChange(key, numOrNull(e.target.value))}
                  disabled={changeToDetails}
                />
              </div>
            ))}

            <div className='space-y-2'>
              <Label htmlFor='superficieGlobale' className='text-sm font-medium'>
                Superficie Globale
              </Label>
              <Input
                id='superficieGlobale'
                readOnly
                value={item?.superficie ?? ''}
                className='bg-gray-50 text-gray-500'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='surfaceTerrain' className='text-sm font-medium'>
                Surface Terrain
              </Label>
              <Input
                id='surfaceTerrain'
                type='number'
                value={formData.surfaceTerrain ?? 0}
                onChange={(e) => handleChange('surfaceTerrain', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='nombrePlacesParking' className='text-sm font-medium'>
                Place parking
              </Label>
              <Input
                id='nombrePlacesParking'
                type='number'
                value={formData.nombrePlacesParking ?? 0}
                onChange={(e) => handleChange('nombrePlacesParking', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
          </Section>

          <Section icon={FileText} title='Façade'>
            <div className='space-y-2'>
              <Label htmlFor='facadePrincipale' className='text-sm font-medium'>
                Façade Principale
              </Label>
              <Input
                id='facadePrincipale'
                type='number'
                value={formData.facadePrincipale ?? 0}
                onChange={(e) => handleChange('facadePrincipale', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='facadeArriere' className='text-sm font-medium'>
                Façade Arrière
              </Label>
              <Input
                id='facadeArriere'
                type='number'
                value={formData.facadeArriere ?? 0}
                onChange={(e) => handleChange('facadeArriere', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='facadeLateraleDroite' className='text-sm font-medium'>
                Façade Latérale Droite
              </Label>
              <Input
                id='facadeLateraleDroite'
                type='number'
                value={formData.facadeLateraleDroite ?? 0}
                onChange={(e) => handleChange('facadeLateraleDroite', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='facadeLateraleGauche' className='text-sm font-medium'>
                Façade Latérale Gauche
              </Label>
              <Input
                id='facadeLateraleGauche'
                type='number'
                value={formData.facadeLateraleGauche ?? 0}
                onChange={(e) => handleChange('facadeLateraleGauche', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='facadeEnBiais' className='text-sm font-medium'>
                Façade En Biais
              </Label>
              <Input
                id='facadeEnBiais'
                type='number'
                value={formData.facadeEnBiais ?? 0}
                onChange={(e) => handleChange('facadeEnBiais', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='longueurFacade' className='text-sm font-medium'>
                Longueur Façade
              </Label>
              <Input
                id='longueurFacade'
                readOnly
                value={item?.longueurFacade ?? ''}
                className='bg-gray-50 text-gray-500'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='nbFacade' className='text-sm font-medium'>
                Nombre Façade
              </Label>
              <Input
                id='nbFacade'
                type='number'
                value={formData.nbFacade ?? 0}
                onChange={(e) => handleChange('nbFacade', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
          </Section>

          <div className='border rounded-lg overflow-hidden'>
            <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
              <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
                <FileText className='h-4 w-4' />
              </div>
              <h3 className='text-base font-semibold text-gray-900'>Pièces jointes / Images</h3>
            </div>
            <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='autreFichier' className='text-sm font-medium'>
                  Fichier
                </Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id='autreFichier'
                    readOnly
                    value={autreFichier?.name ?? ''}
                    placeholder='Aucun fichier sélectionné'
                    className='bg-gray-50 text-gray-500'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    disabled={changeToDetails}
                    onClick={() => autreFichierInputRef.current?.click()}
                  >
                    Parcourir
                  </Button>
                  <input
                    type='file'
                    ref={autreFichierInputRef}
                    className='hidden'
                    onChange={(e) => setAutreFichier(e.target.files?.[0] ?? null)}
                  />
                  <Button
                    type='button'
                    size='icon'
                    disabled={changeToDetails || !autreFichier}
                    onClick={() => {
                      if (!autreFichier) return;
                      setAutresDocuments((prev) => [...prev, autreFichier.name]);
                      setAutreFichier(null);
                    }}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Document joint</Label>
                <div className='min-h-10 rounded-md border px-3 py-2 text-sm text-gray-600'>
                  {autresDocuments.length > 0 ? autresDocuments.join(', ') : '-'}
                </div>
              </div>
            </div>
          </div>

          <Section icon={MapPin} title='Géolocalisation'>
            <div className='space-y-2'>
              <Label htmlFor='latitude' className='text-sm font-medium'>
                Latitude
              </Label>
              <Input
                id='latitude'
                type='number'
                value={formData.latitude ?? ''}
                onChange={(e) => handleChange('latitude', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='longitude' className='text-sm font-medium'>
                Longitude
              </Label>
              <Input
                id='longitude'
                type='number'
                value={formData.longitude ?? ''}
                onChange={(e) => handleChange('longitude', numOrNull(e.target.value))}
                disabled={changeToDetails}
              />
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

      <BaseDialog
        open={agenceDialogOpen}
        onOpenChange={setAgenceDialogOpen}
        title='Ajouter une Agence Immobilière'
        onCancel={() => setAgenceDialogOpen(false)}
        onConfirm={handleAgenceSubmit}
        confirmText='Sauvegarder'
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='raisonSocial' className='text-sm font-medium'>
              Raison sociale
            </Label>
            <Input
              id='raisonSocial'
              value={agenceForm.raisonSocial}
              onChange={(e) => setAgenceForm((prev) => ({ ...prev, raisonSocial: e.target.value }))}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='adresseAgence' className='text-sm font-medium'>
              Adresse
            </Label>
            <Input
              id='adresseAgence'
              value={agenceForm.adresse ?? ''}
              onChange={(e) => setAgenceForm((prev) => ({ ...prev, adresse: e.target.value }))}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='emailAgence' className='text-sm font-medium'>
              Email
            </Label>
            <Input
              id='emailAgence'
              value={agenceForm.email ?? ''}
              onChange={(e) => setAgenceForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='teleAgence' className='text-sm font-medium'>
              Téléphone
            </Label>
            <Input
              id='teleAgence'
              value={agenceForm.tele ?? ''}
              onChange={(e) => setAgenceForm((prev) => ({ ...prev, tele: e.target.value }))}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='contactPrincipal' className='text-sm font-medium'>
              Contact Principal
            </Label>
            <Input
              id='contactPrincipal'
              value={agenceForm.contactPrincipal ?? ''}
              onChange={(e) => setAgenceForm((prev) => ({ ...prev, contactPrincipal: e.target.value }))}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='teleContactPrincipal' className='text-sm font-medium'>
              Téléphone Contact Principal
            </Label>
            <Input
              id='teleContactPrincipal'
              value={agenceForm.teleContactPrincipal ?? ''}
              onChange={(e) => setAgenceForm((prev) => ({ ...prev, teleContactPrincipal: e.target.value }))}
            />
          </div>
        </div>
      </BaseDialog>
    </Card>
  );
};

export default BienForm;
