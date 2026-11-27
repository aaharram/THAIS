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
  AFFECTATIONS,
  BUILDING_ATTACHMENT_SLOTS,
  BuildingAttachmentField,
  BuildingPieceJointe,
  BuildingRequest,
  BuildingRequestSchema,
  ImmobilisationEnCours,
  PROPRIETE_TYPES,
  PROVENANCES_ACTIF,
  TYPES_TF,
} from '@/store/features/patrimoine/building-schemas';
import {
  createBuilding,
  editBuilding,
  getBuildingById,
  resetBuilding,
} from '@/store/features/patrimoine/buildingsSlice';
import { useAppSelector } from '@/store/hooks';
import { downloadAttachment, uploadAttachment } from '@/store/services/attachments';
import {
  addBuildingPieceJointe,
  deleteBuildingPieceJointe,
  getBuildingImmobilisationsEnCours,
  getBuildingPiecesJointes,
} from '@/store/services/buildingExtras';
import { loadGoogleMaps } from '@/utils/maps/loadGoogleMaps';
import {
  Building2,
  ChevronDown,
  Download,
  FolderOpen,
  Globe,
  Hammer,
  Info,
  Loader2,
  MapPin,
  Paperclip,
  Plus,
  RefreshCw,
  Ruler,
  Trash2,
  Wallet,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router';

const backPath = '/patrimoine/actifs';
const ATTACHMENT_FOLDER = 'actifs';

// RMANew (DataEntryBuilding.vb, GetOptions) : vue de départ de la carte selon le contexte.
const MAP_CENTER_NEW = { lat: 30.689886, lng: -7.603869 };
const MAP_CENTER_EXISTING = { lat: 34.03715, lng: -4.9998 };

type PendingDoc = { fileName: string; pieceJointe: string; taille: number };

const emptyForm: BuildingRequest = {
  codeImmeuble: '',
  designation: '',
  enExploitation: false,
  noArticle: '',
  noBuildingType: null,
  compteGeneral: '',
  nAffectation: '',
  noEncaisseur: null,
  provenanceActif: null,
  ajouterContrainte: false,
  noProprieteType: 'Mono-propriété',
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
  noCountry: null,
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
  nombreEtages: null,
  accueil: false,
  securite: false,
  revetement: false,
  peinture: false,
  fauxPlafond: false,
  reseaux: false,
  climatisation: false,
  inactif: false,
  buildingImage: null,
  buildingPlan: null,
  buildingPlanCadastrale: null,
  certificatPropriete: null,
  regInterieur: null,
  certifconformite: null,
  contratAcquisition: null,
};

// Clés réellement acceptées par l'API : on recopie TOUTES celles de l'actif chargé (et pas
// seulement celles affichées ici) sinon une modification depuis cette fiche écraserait par du
// vide les champs que la fiche n'affiche pas (superficies, cession, prospection...).
const REQUEST_KEYS = Object.keys(BuildingRequestSchema.shape);

const buildFormFromItem = (item: Record<string, unknown>, userId: number): BuildingRequest => {
  const data: Record<string, unknown> = { ...emptyForm };
  for (const key of REQUEST_KEYS) {
    const value = item[key];
    if (value === undefined) continue;
    // Les <input type="date"> attendent AAAA-MM-JJ, l'API renvoie un horodatage ISO.
    data[key] =
      typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) ? value.substring(0, 10) : value;
  }
  data.addUser = (item.addUser as number | null | undefined) ?? undefined;
  data.modUser = userId;
  return data as BuildingRequest;
};

const fmtMontant = (m?: number | null) =>
  m == null ? '' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Conteneur de la fiche (RMANew : .containerHeadline + .floatingBox), repliable via le caret.
const Box = ({
  icon: Icon,
  title,
  collapsible = true,
  children,
}: {
  icon: typeof Info;
  title: string;
  collapsible?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className='border rounded-lg overflow-hidden bg-white'>
      <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
        <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
          <Icon className='h-4 w-4' />
        </div>
        <h3 className='text-base font-semibold text-gray-900'>{title}</h3>
        {collapsible && (
          <button
            type='button'
            className='ml-auto text-gray-500 hover:text-gray-800'
            title={open ? 'Réduire' : 'Développer'}
            onClick={() => setOpen(!open)}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? '' : '-rotate-90'}`} />
          </button>
        )}
      </div>
      <div
        className={`${open ? '' : 'hidden'} p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 [&_input:not([type=checkbox])]:w-full [&_[role=combobox]]:w-full [&_textarea]:w-full items-start`}
      >
        {children}
      </div>
    </div>
  );
};

const Field = ({
  label,
  htmlFor,
  required,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`space-y-2 ${className ?? ''}`}>
    <Label htmlFor={htmlFor} className='text-sm font-medium'>
      {required && <span className='text-red-500'>* </span>}
      {label}
    </Label>
    {children}
    {error && <p className='text-red-600 text-sm'>{error}</p>}
  </div>
);

const Calculated = ({ id, value }: { id: string; value: string }) => (
  <Input id={id} value={value} readOnly disabled className='bg-gray-50' />
);

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const prospectionId = Number(searchParams.get('prospection')) || null;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails] = useState<boolean>(details ?? false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.buildings.item);
  const { allItems: buildingTypes } = useAppSelector((state) => state.cfgBuildingTypes);
  const { allItems: encaisseurs } = useAppSelector((state) => state.cfgEncaisseurs);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const { allItems: villes } = useAppSelector((state) => state.cfgVilles);
  const { allItems: paysList } = useAppSelector((state) => state.cfgPays);

  const [formData, setFormData] = useState<BuildingRequest>({
    ...emptyForm,
    noProspection: item ? emptyForm.noProspection : prospectionId,
    // Règle métier RMANew (DataEntryBiens.vb DefaultValue("NoCountry", 103)) : un actif ajouté
    // depuis une prospection est pré-rempli avec le pays par défaut (Maroc).
    noCountry: item || !prospectionId ? emptyForm.noCountry : 1,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  // Pièces jointes nommées / documents libres / immobilisations en cours
  const [pickedNames, setPickedNames] = useState<Record<string, string>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const slotInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const [docs, setDocs] = useState<BuildingPieceJointe[]>([]);
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docBusy, setDocBusy] = useState(false);
  const docInput = useRef<HTMLInputElement | null>(null);
  const [immos, setImmos] = useState<ImmobilisationEnCours[]>([]);

  // Géolocalisation
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const readOnlyRef = useRef(changeToDetails);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    readOnlyRef.current = changeToDetails;
    markerRef.current?.setDraggable(!changeToDetails);
  }, [changeToDetails]);

  useEffect(() => {
    dispatch(lookupModules.cfgBuildingTypes.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgEncaisseurs.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgVilles.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgPays.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getBuildingById(Number(id)));
    }
  }, [id, dispatch]);

  const itemNumero = item?.numero;
  useEffect(() => {
    if (!itemNumero) return;
    getBuildingPiecesJointes(itemNumero)
      .then(setDocs)
      .catch(() => setDocs([]));
    getBuildingImmobilisationsEnCours(itemNumero)
      .then(setImmos)
      .catch(() => setImmos([]));
  }, [itemNumero]);

  useEffect(() => {
    if (item) {
      setFormData(buildFormFromItem(item as unknown as Record<string, unknown>, userId));
    }
  }, [item, userId]);

  const handleChange = <T extends keyof BuildingRequest>(field: T, value: BuildingRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- Carte (RMANew : double-clic pour poser le point, marqueur déplaçable) ---
  const setCoords = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    }));
  };

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapDivRef.current || mapRef.current) return;
        const map = new google.maps.Map(mapDivRef.current, {
          center: MAP_CENTER_NEW,
          zoom: 6,
          mapTypeControl: false,
          disableDoubleClickZoom: true,
        });
        map.addListener('dblclick', (e: google.maps.MapMouseEvent) => {
          if (readOnlyRef.current || !e.latLng) return;
          setCoords(e.latLng.lat(), e.latLng.lng());
        });
        mapRef.current = map;
        setMapReady(true);
      })
      .catch((e: Error) => setMapError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    const lat = formData.latitude;
    const lng = formData.longitude;
    if (lat != null && lng != null && !(lat === 0 && lng === 0)) {
      const position = { lat, lng };
      if (!markerRef.current) {
        const marker = new google.maps.Marker({
          position,
          map,
          draggable: !readOnlyRef.current,
          title: 'Emplacement de l’actif',
        });
        marker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) setCoords(e.latLng.lat(), e.latLng.lng());
        });
        markerRef.current = marker;
      } else {
        markerRef.current.setPosition(position);
      }
      map.setCenter(position);
      map.setZoom(17);
    } else {
      markerRef.current?.setMap(null);
      markerRef.current = null;
      map.setCenter(item ? MAP_CENTER_EXISTING : MAP_CENTER_NEW);
      map.setZoom(item ? 8 : 6);
    }
  }, [mapReady, formData.latitude, formData.longitude, item]);

  // --- Pièces jointes nommées ---
  const attachmentLabel = (field: BuildingAttachmentField, prefix: string) => {
    const stored = formData[field];
    if (!stored) return '';
    if (pickedNames[field]) return pickedNames[field];
    const dot = stored.lastIndexOf('.');
    return `${prefix}${dot >= 0 ? stored.substring(dot) : ''}`;
  };

  const handleSlotFile = async (field: BuildingAttachmentField, file: File) => {
    setUploadingField(field);
    setUploadError(null);
    try {
      const storedName = await uploadAttachment(ATTACHMENT_FOLDER, file);
      handleChange(field, storedName);
      setPickedNames((prev) => ({ ...prev, [field]: file.name }));
    } catch {
      setUploadError(`Échec de l'envoi de « ${file.name} ».`);
    } finally {
      setUploadingField(null);
    }
  };

  const clearSlot = (field: BuildingAttachmentField) => {
    handleChange(field, null);
    setPickedNames((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // --- Complètement Pièces jointes (documents libres) ---
  const addDoc = async () => {
    if (!docFile) return;
    setDocBusy(true);
    setUploadError(null);
    try {
      const storedName = await uploadAttachment(ATTACHMENT_FOLDER, docFile);
      const payload = { fileName: docFile.name, pieceJointe: storedName, taille: docFile.size };
      if (item) {
        const created = await addBuildingPieceJointe(item.numero, { ...payload, addUser: userId });
        setDocs((prev) => [...prev, created]);
      } else {
        // Actif pas encore enregistré : le document est rattaché à la sauvegarde.
        setPendingDocs((prev) => [...prev, payload]);
      }
      setDocFile(null);
    } catch {
      setUploadError("Échec de l'envoi du document.");
    } finally {
      setDocBusy(false);
    }
  };

  const removeDoc = async (doc: BuildingPieceJointe) => {
    if (!item) return;
    try {
      await deleteBuildingPieceJointe(item.numero, doc.numero);
      setDocs((prev) => prev.filter((d) => d.numero !== doc.numero));
    } catch {
      setUploadError('Échec de la suppression du document.');
    }
  };

  const documentRows: { key: string; name: string; stored: string; onDelete: () => void }[] = [
    ...docs.map((d) => ({
      key: `d${d.numero}`,
      name: d.fileName,
      stored: d.pieceJointe,
      onDelete: () => removeDoc(d),
    })),
    ...pendingDocs.map((p, i) => ({
      key: `p${i}`,
      name: p.fileName,
      stored: p.pieceJointe,
      onDelete: () => setPendingDocs((prev) => prev.filter((_, idx) => idx !== i)),
    })),
  ];

  // --- Validation ---
  const validate = (data: BuildingRequest) => {
    const errorMap: { [key: string]: string } = {};
    const parsed = BuildingRequestSchema.safeParse(data);
    if (!parsed.success) {
      parsed.error.errors.forEach((e) => {
        errorMap[e.path[0] as string] = e.message;
      });
    }
    // Champs marqués d'une étoile rouge dans RMANew (DataEntryBuilding.aspx). Un « bien » ajouté
    // depuis une prospection suit d'autres règles (DataEntryBiens) : on ne lui impose pas ceux-ci.
    if (!data.noProspection) {
      if (!data.noArticle?.trim()) errorMap.noArticle = 'Le N° Article / TSC est requis.';
      if (!data.noBuildingType) errorMap.noBuildingType = "Le type d'actif est requis.";
      if (!data.noProprietaire) errorMap.noProprietaire = 'Le propriétaire est requis.';
      if (!data.noCity) errorMap.noCity = 'La ville est requise.';
      if (!data.noCountry) errorMap.noCountry = 'Le pays est requis.';
    }
    setErrors(errorMap);
    return Object.keys(errorMap).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(formData)) return;

    if (item) {
      await dispatch(editBuilding({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetBuilding());
    } else {
      const created = await dispatch(createBuilding(formData)).unwrap();
      await Promise.allSettled(
        pendingDocs.map((d) => addBuildingPieceJointe(created.numero, { ...d, addUser: userId })),
      );
    }

    // Règle métier RMANew (DataEntryBiens.vb cRedirectOnSave) : un actif ajouté depuis une
    // prospection retourne vers la liste des actifs de cette prospection, pas la liste générale.
    navigate(formData.noProspection ? `${backPath}?prospection=${formData.noProspection}` : backPath);
  };

  const numOrNull = (v: string) => (v === '' ? null : Number(v));

  // Valeur d'entrée = terrain + construction + aménagement (même somme que l'API, qui la
  // stocke dans ValeurInventaire). Valeur inventaire = valeur d'entrée − amortissements −
  // provisions (RMANew DataEntryBuilding.Validate : ValInv = ValBrut − SumAmortiss − Provision).
  const valeurEntree =
    (formData.valeurEntreeTerrain ?? 0) + (formData.valeurEntreeConstruction ?? 0) + (formData.valeurAmenagement ?? 0);
  const valeurInventaire = item ? valeurEntree - (item.totalAmortissement ?? 0) - (item.totalProvision ?? 0) : null;

  const errorClass = (key: string) => (errors[key] ? 'border-red-300 focus:border-red-500' : '');

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle className='flex justify-between'>
          <Title
            title={
              changeToDetails
                ? `Détails "${formData.designation}"`
                : item
                ? `Modifier "${formData.designation}"`
                : 'Ajouter un actif'
            }
          />
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className='py-6 px-4 sm:px-6'>
        <form onSubmit={handleSubmit}>
          {/* Conteneurs de RMANew (DataEntryBuilding.aspx) dans le même ordre, mais empilés les uns
              sous les autres sur toute la largeur ; chaque conteneur répartit ses champs sur 3 colonnes
              quand l'écran est assez large. */}
          <div className='space-y-6'>
            {/* ===================== COLONNE GAUCHE ===================== */}
            <div className='space-y-6 min-w-0'>
              <Box icon={Building2} title='Actif'>
                <Field label='Code analytique' htmlFor='codeImmeuble' required error={errors.codeImmeuble}>
                  <Input
                    id='codeImmeuble'
                    value={formData.codeImmeuble}
                    onChange={(e) => handleChange('codeImmeuble', e.target.value)}
                    disabled={changeToDetails}
                    className={errorClass('codeImmeuble')}
                  />
                </Field>

                {/* RMANew : « En Exploitation » est sur la même ligne que le nom de l'actif. */}
                <Field label='Nom propriété' htmlFor='designation' required error={errors.designation}>
                  <div className='flex items-center gap-3'>
                    <Input
                      id='designation'
                      value={formData.designation}
                      onChange={(e) => handleChange('designation', e.target.value)}
                      disabled={changeToDetails}
                      className={`flex-1 min-w-0 ${errorClass('designation')}`}
                    />
                    <label className='flex items-center gap-2 text-sm whitespace-nowrap'>
                      <Checkbox
                        checked={formData.enExploitation}
                        onCheckedChange={(c) => handleChange('enExploitation', c === true)}
                        disabled={changeToDetails}
                      />
                      En Exploitation
                    </label>
                  </div>
                </Field>

                <Field label='N° Article / TSC' htmlFor='noArticle' required error={errors.noArticle}>
                  <Input
                    id='noArticle'
                    value={formData.noArticle ?? ''}
                    onChange={(e) => handleChange('noArticle', e.target.value)}
                    disabled={changeToDetails}
                    className={errorClass('noArticle')}
                  />
                </Field>

                <Field label='Type Actif' htmlFor='noBuildingType' required error={errors.noBuildingType}>
                  <Select
                    value={formData.noBuildingType?.toString() || '0'}
                    onValueChange={(value) => handleChange('noBuildingType', value === '0' ? null : Number(value))}
                    disabled={changeToDetails}
                  >
                    <SelectTrigger id='noBuildingType' className={errorClass('noBuildingType')}>
                      <SelectValue placeholder='Sélectionnez un type...' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>Aucun</SelectItem>
                      {buildingTypes.map((t) => (
                        <SelectItem key={t.numero} value={t.numero.toString()}>
                          {t.designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label='Sous compte' htmlFor='compteGeneral'>
                  <Input
                    id='compteGeneral'
                    value={formData.compteGeneral ?? ''}
                    onChange={(e) => handleChange('compteGeneral', e.target.value)}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Affectation' htmlFor='nAffectation' required error={errors.nAffectation}>
                  <Select
                    value={formData.nAffectation}
                    onValueChange={(value) => handleChange('nAffectation', value)}
                    disabled={changeToDetails}
                  >
                    <SelectTrigger id='nAffectation' className={errors.nAffectation ? 'border-red-300' : ''}>
                      <SelectValue placeholder='Sélectionnez...' />
                    </SelectTrigger>
                    <SelectContent>
                      {AFFECTATIONS.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* RMANew : bouton « Rafraîchir » à côté de la liste des encaisseurs. */}
                <Field label='Encaisseur' htmlFor='noEncaisseur'>
                  <div className='flex items-center gap-2'>
                    <div className='flex-1 min-w-0'>
                      <Select
                        value={formData.noEncaisseur?.toString() || '0'}
                        onValueChange={(value) => handleChange('noEncaisseur', value === '0' ? null : Number(value))}
                        disabled={changeToDetails}
                      >
                        <SelectTrigger id='noEncaisseur' className='w-full'>
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
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 shrink-0'
                      title='Rafraîchir'
                      onClick={() => dispatch(lookupModules.cfgEncaisseurs.getAll({ pageSize: 1000 }))}
                    >
                      <RefreshCw className='h-4 w-4' />
                    </Button>
                  </div>
                </Field>

                <Field label="Provenance de l'actif" htmlFor='provenanceActif'>
                  <Select
                    value={formData.provenanceActif ?? ''}
                    onValueChange={(value) => handleChange('provenanceActif', value)}
                    disabled={changeToDetails}
                  >
                    <SelectTrigger id='provenanceActif'>
                      <SelectValue placeholder='Sélectionnez...' />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVENANCES_ACTIF.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* RMANew : liste Oui / Non (et non une case à cocher). */}
                <Field label='Ajouter Contrainte' htmlFor='ajouterContrainte'>
                  <Select
                    value={formData.ajouterContrainte ? 'Oui' : 'Non'}
                    onValueChange={(value) => handleChange('ajouterContrainte', value === 'Oui')}
                    disabled={changeToDetails}
                  >
                    <SelectTrigger id='ajouterContrainte'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Oui'>Oui</SelectItem>
                      <SelectItem value='Non'>Non</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field label='Type propriété' htmlFor='noProprieteType' required>
                  <Select
                    value={formData.noProprieteType}
                    onValueChange={(value) => handleChange('noProprieteType', value)}
                    disabled={changeToDetails}
                  >
                    <SelectTrigger id='noProprieteType'>
                      <SelectValue placeholder='Sélectionnez...' />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Ancienne valeur hors liste RMA (ex. « Immeuble ») : affichée pour ne pas la perdre. */}
                      {formData.noProprieteType &&
                        !(PROPRIETE_TYPES as readonly string[]).includes(formData.noProprieteType) && (
                          <SelectItem value={formData.noProprieteType}>{formData.noProprieteType}</SelectItem>
                        )}
                      {PROPRIETE_TYPES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label='Propriétaire' htmlFor='noProprietaire' required error={errors.noProprietaire}>
                  <Select
                    value={formData.noProprietaire?.toString() || '0'}
                    onValueChange={(value) => handleChange('noProprietaire', value === '0' ? null : Number(value))}
                    disabled={changeToDetails}
                  >
                    <SelectTrigger id='noProprietaire' className={errorClass('noProprietaire')}>
                      <SelectValue placeholder='Sélectionnez...' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>Aucun</SelectItem>
                      {proprietaires.map((p) => (
                        <SelectItem key={p.numero} value={p.numero.toString()}>
                          {p.designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label='Gestionnaire Syndic' htmlFor='responsable'>
                  <Input
                    id='responsable'
                    value={formData.responsable ?? ''}
                    onChange={(e) => handleChange('responsable', e.target.value)}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Contact Gestionnaire Syndic' htmlFor='contactResponsable'>
                  <Input
                    id='contactResponsable'
                    value={formData.contactResponsable ?? ''}
                    onChange={(e) => handleChange('contactResponsable', e.target.value)}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Titre foncier mère' htmlFor='titreFoncier'>
                  <Input
                    id='titreFoncier'
                    value={formData.titreFoncier ?? ''}
                    onChange={(e) => handleChange('titreFoncier', e.target.value)}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Type Titre foncier' htmlFor='typeTF'>
                  <Select
                    value={formData.typeTF ?? ''}
                    onValueChange={(value) => handleChange('typeTF', value)}
                    disabled={changeToDetails}
                  >
                    <SelectTrigger id='typeTF'>
                      <SelectValue placeholder='Sélectionnez...' />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES_TF.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className='flex items-center gap-2 sm:pt-8'>
                  <Checkbox
                    id='aVendre'
                    checked={formData.aVendre}
                    onCheckedChange={(c) => handleChange('aVendre', c === true)}
                    disabled={changeToDetails}
                  />
                  <Label htmlFor='aVendre'>A Vendre</Label>
                </div>

                <Field label='Descriptif' htmlFor='notes' className='col-span-full'>
                  <Textarea
                    id='notes'
                    rows={5}
                    value={formData.notes ?? ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    disabled={changeToDetails}
                  />
                </Field>
              </Box>

              <Box icon={MapPin} title='Localisation'>
                <Field label='Adresse' htmlFor='address1'>
                  <Input
                    id='address1'
                    value={formData.address1 ?? ''}
                    onChange={(e) => handleChange('address1', e.target.value)}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Code postal' htmlFor='postalCode'>
                  <Input
                    id='postalCode'
                    value={formData.postalCode ?? ''}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Ville' htmlFor='noCity' required error={errors.noCity}>
                  <Select
                    value={formData.noCity?.toString() || '0'}
                    onValueChange={(value) => handleChange('noCity', value === '0' ? null : Number(value))}
                    disabled={changeToDetails}
                  >
                    <SelectTrigger id='noCity' className={errorClass('noCity')}>
                      <SelectValue placeholder='Sélectionnez une ville...' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>Aucune</SelectItem>
                      {villes.map((v) => (
                        <SelectItem key={v.numero} value={v.numero.toString()}>
                          {v.designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label='Pays' htmlFor='noCountry' required error={errors.noCountry}>
                  <Select
                    value={formData.noCountry?.toString() || '0'}
                    onValueChange={(value) => handleChange('noCountry', value === '0' ? null : Number(value))}
                    disabled={changeToDetails}
                  >
                    <SelectTrigger id='noCountry' className={errorClass('noCountry')}>
                      <SelectValue placeholder='Sélectionnez un pays...' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>Aucun</SelectItem>
                      {paysList.map((p) => (
                        <SelectItem key={p.numero} value={p.numero.toString()}>
                          {p.designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </Box>

              <Box icon={Wallet} title='Inventaire / Expertise'>
                <Field label="Valeur d'entrée" htmlFor='valeurEntree'>
                  <Calculated id='valeurEntree' value={fmtMontant(valeurEntree)} />
                </Field>

                <Field label='Valeur Entrée Terrain' htmlFor='valeurEntreeTerrain'>
                  <Input
                    id='valeurEntreeTerrain'
                    type='number'
                    step='0.01'
                    value={formData.valeurEntreeTerrain ?? ''}
                    onChange={(e) => handleChange('valeurEntreeTerrain', numOrNull(e.target.value))}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label="Date d'acquisition" htmlFor='dateAcquisition'>
                  <Input
                    id='dateAcquisition'
                    type='date'
                    value={formData.dateAcquisition ?? ''}
                    onChange={(e) => handleChange('dateAcquisition', e.target.value)}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Valeur Entrée Construction' htmlFor='valeurEntreeConstruction'>
                  <Input
                    id='valeurEntreeConstruction'
                    type='number'
                    step='0.01'
                    value={formData.valeurEntreeConstruction ?? ''}
                    onChange={(e) => handleChange('valeurEntreeConstruction', numOrNull(e.target.value))}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Valeur Aménagement' htmlFor='valeurAmenagement'>
                  <Input
                    id='valeurAmenagement'
                    type='number'
                    step='0.01'
                    value={formData.valeurAmenagement ?? ''}
                    onChange={(e) => handleChange('valeurAmenagement', numOrNull(e.target.value))}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Total Amortissement' htmlFor='totalAmortissement'>
                  <Calculated id='totalAmortissement' value={item ? fmtMontant(item.totalAmortissement) : ''} />
                </Field>

                <Field label='Total Provision' htmlFor='totalProvision'>
                  <Calculated id='totalProvision' value={item ? fmtMontant(item.totalProvision ?? 0) : ''} />
                </Field>

                <Field label='Valeur inventaire' htmlFor='valeurInventaire'>
                  <Calculated id='valeurInventaire' value={fmtMontant(valeurInventaire)} />
                </Field>

                <Field label='Valeur Expertise Total' htmlFor='valeurExpertiseTotal'>
                  <Calculated id='valeurExpertiseTotal' value={item ? fmtMontant(item.valeurExpertiseTotal) : ''} />
                </Field>

                <Field label='Date Expertise' htmlFor='dateExpertise'>
                  <Calculated
                    id='dateExpertise'
                    value={item?.dateExpertise ? new Date(item.dateExpertise).toLocaleDateString('fr-FR') : ''}
                  />
                </Field>

                <Field label='Valeur Expertise Terrain' htmlFor='valeurExpertiseTerrain'>
                  <Calculated id='valeurExpertiseTerrain' value={item ? fmtMontant(item.valeurExpertiseTerrain) : ''} />
                </Field>

                <Field label='Valeur Expertise Construction' htmlFor='valeurExpertiseConstruction'>
                  <Calculated
                    id='valeurExpertiseConstruction'
                    value={item ? fmtMontant(item.valeurExpertiseConstruction) : ''}
                  />
                </Field>

                <Field label='Date Modification' htmlFor='dateModificationValeur'>
                  <Input
                    id='dateModificationValeur'
                    type='date'
                    value={formData.dateModificationValeur ?? ''}
                    onChange={(e) => handleChange('dateModificationValeur', e.target.value)}
                    disabled={changeToDetails}
                  />
                </Field>
              </Box>

              {item && (
                <Box icon={Hammer} title='Immobilisation en cours'>
                  <div className='col-span-full overflow-x-auto border rounded-md'>
                    <table className='w-full text-sm'>
                      <thead className='bg-gray-50 text-left'>
                        <tr>
                          <th className='px-3 py-2 font-semibold'>Prestation</th>
                          <th className='px-3 py-2 font-semibold'>Date Début</th>
                          <th className='px-3 py-2 font-semibold'>Valeur Entrée</th>
                          <th className='px-3 py-2 font-semibold'>Total Amorti</th>
                        </tr>
                      </thead>
                      <tbody>
                        {immos.length === 0 ? (
                          <tr>
                            <td colSpan={4} className='px-3 py-3 text-center text-gray-500'>
                              Aucune prestation
                            </td>
                          </tr>
                        ) : (
                          immos.map((r) => (
                            <tr key={r.numero} className='border-t'>
                              <td className='px-3 py-2'>{r.prestation}</td>
                              <td className='px-3 py-2'>
                                {r.dateDebut ? new Date(r.dateDebut).toLocaleDateString('fr-FR') : '--'}
                              </td>
                              <td className='px-3 py-2'>{fmtMontant(r.valeurEntree)}</td>
                              <td className='px-3 py-2'>{fmtMontant(r.totalAmorti)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Box>
              )}

            </div>

            {/* ===================== COLONNE DROITE ===================== */}
            <div className='space-y-6 min-w-0'>
              <Box icon={Ruler} title="Complément d'informations">
                <Field label='Code terrain' htmlFor='unitCode'>
                  <Input
                    id='unitCode'
                    value={formData.unitCode ?? ''}
                    onChange={(e) => handleChange('unitCode', e.target.value)}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Surface Terrain' htmlFor='surfaceTerrain'>
                  <Input
                    id='surfaceTerrain'
                    type='number'
                    step='0.01'
                    value={formData.surfaceTerrain ?? ''}
                    onChange={(e) => handleChange('surfaceTerrain', numOrNull(e.target.value))}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Surface Construite' htmlFor='surfaceUtile'>
                  <Input
                    id='surfaceUtile'
                    type='number'
                    step='0.01'
                    value={formData.surfaceUtile ?? ''}
                    onChange={(e) => handleChange('surfaceUtile', numOrNull(e.target.value))}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Mezzanine' htmlFor='surfaceEspaceVert'>
                  <Input
                    id='surfaceEspaceVert'
                    type='number'
                    step='0.01'
                    value={formData.surfaceEspaceVert ?? ''}
                    onChange={(e) => handleChange('surfaceEspaceVert', numOrNull(e.target.value))}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Surface Parking' htmlFor='surfaceParking'>
                  <Input
                    id='surfaceParking'
                    type='number'
                    step='0.01'
                    value={formData.surfaceParking ?? ''}
                    onChange={(e) => handleChange('surfaceParking', numOrNull(e.target.value))}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Nb Places Parking' htmlFor='nombrePlacesParking'>
                  <Input
                    id='nombrePlacesParking'
                    type='number'
                    value={formData.nombrePlacesParking ?? ''}
                    onChange={(e) => handleChange('nombrePlacesParking', numOrNull(e.target.value))}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Nb Ascenseurs' htmlFor='nombreAscenseurs'>
                  <Input
                    id='nombreAscenseurs'
                    type='number'
                    value={formData.nombreAscenseurs ?? ''}
                    onChange={(e) => handleChange('nombreAscenseurs', numOrNull(e.target.value))}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Marque Ascenseurs' htmlFor='marqueAscenseur'>
                  <Input
                    id='marqueAscenseur'
                    value={formData.marqueAscenseur ?? ''}
                    onChange={(e) => handleChange('marqueAscenseur', e.target.value)}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Nb Etages' htmlFor='nombreEtages'>
                  <Input
                    id='nombreEtages'
                    type='number'
                    value={formData.nombreEtages ?? ''}
                    onChange={(e) => handleChange('nombreEtages', numOrNull(e.target.value))}
                    disabled={changeToDetails}
                  />
                </Field>

                {/* RMANew : les 7 équipements à droite de « Nb Etages ». */}
                <div className='space-y-1.5 sm:col-span-2'>
                  <p className='text-sm font-semibold'>Équipements</p>
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                  {(
                    [
                      ['accueil', 'Accueil'],
                      ['securite', 'Sécurité'],
                      ['revetement', 'Ménage partie commune'],
                      ['peinture', 'Peinture'],
                      ['fauxPlafond', 'Faux plafond'],
                      ['reseaux', 'Réseaux'],
                      ['climatisation', 'Climatisation'],
                    ] as const
                  ).map(([field, label]) => (
                    <label
                      key={field}
                      className='flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 text-sm transition-colors hover:bg-primary/5'
                    >
                      <Checkbox
                        checked={formData[field]}
                        onCheckedChange={(c) => handleChange(field, c === true)}
                        disabled={changeToDetails}
                      />
                      {label}
                    </label>
                  ))}
                  </div>
                </div>
              </Box>

              <Box icon={Paperclip} title='Pièces jointes'>
                {BUILDING_ATTACHMENT_SLOTS.map(({ field, label, prefix }) => {
                  const stored = formData[field];
                  return (
                    <Field key={field} label={label} htmlFor={field}>
                      <div className='flex items-center gap-1'>
                        <Input
                          id={field}
                          readOnly
                          value={attachmentLabel(field, prefix)}
                          className='flex-1 min-w-0 bg-gray-50'
                        />
                        {stored && (
                          <>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 shrink-0'
                              title='Télécharger'
                              onClick={() =>
                                downloadAttachment(ATTACHMENT_FOLDER, stored, pickedNames[field] || undefined)
                              }
                            >
                              <Download className='h-4 w-4' />
                            </Button>
                            {!changeToDetails && (
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8 shrink-0'
                                title='Supprimer'
                                onClick={() => clearSlot(field)}
                              >
                                <Trash2 className='h-4 w-4 text-red-600' />
                              </Button>
                            )}
                          </>
                        )}
                        {!changeToDetails && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-8 px-2 shrink-0 text-blue-600 hover:text-sky-700 dark:text-sky-400 hover:bg-sky-500/10'
                            disabled={uploadingField === field}
                            onClick={() => slotInputs.current[field]?.click()}
                          >
                            {uploadingField === field ? (
                              <Loader2 className='h-4 w-4 mr-1 animate-spin' />
                            ) : (
                              <FolderOpen className='h-4 w-4 mr-1' />
                            )}
                            Parcourir
                          </Button>
                        )}
                        <input
                          ref={(el) => {
                            slotInputs.current[field] = el;
                          }}
                          type='file'
                          className='hidden'
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (file) handleSlotFile(field, file);
                          }}
                        />
                      </div>
                    </Field>
                  );
                })}
              </Box>

              <Box icon={Paperclip} title='Complètement Pièces jointes'>
                <>
                  {/* RMANew : « Fichier » et « Document joint » côte à côte sur la même ligne. */}
                  {!changeToDetails && (
                    <Field label='Fichier' htmlFor='docFichier' className='lg:col-span-2'>
                      <div className='flex items-center gap-2'>
                        <Input
                          id='docFichier'
                          readOnly
                          value={docFile?.name ?? ''}
                          className='flex-1 min-w-0 bg-gray-50'
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='h-8 px-2 shrink-0 text-blue-600 hover:text-sky-700 dark:text-sky-400 hover:bg-sky-500/10'
                          onClick={() => docInput.current?.click()}
                        >
                          <FolderOpen className='h-4 w-4 mr-1' />
                          Parcourir
                        </Button>
                        <Button
                          type='button'
                          size='icon'
                          className='h-9 w-9 shrink-0 rounded-lg bg-[#1c4d8c] hover:bg-[#163e72] text-white'
                          title='Ajouter'
                          disabled={!docFile || docBusy}
                          onClick={addDoc}
                        >
                          {docBusy ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}
                        </Button>
                        <input
                          ref={docInput}
                          type='file'
                          className='hidden'
                          onChange={(e) => {
                            setDocFile(e.target.files?.[0] ?? null);
                            e.target.value = '';
                          }}
                        />
                      </div>
                    </Field>
                  )}

                  <div className={changeToDetails ? 'col-span-full' : 'lg:col-span-1'}>
                    <h4 className='text-sm font-semibold mb-2'>Document joint</h4>
                    {documentRows.length === 0 ? (
                      <p className='text-sm text-gray-500'>Aucun document joint.</p>
                    ) : (
                      <ul className='border rounded-lg divide-y'>
                        {documentRows.map((row) => (
                          <li key={row.key} className='flex items-center justify-between px-3 py-2 text-sm'>
                            <span className='font-medium truncate pr-3' title={row.name}>
                              {row.name}
                            </span>
                            <span className='flex items-center gap-1 shrink-0'>
                              {!changeToDetails && (
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  className='h-7 w-7'
                                  title='Supprimer'
                                  onClick={row.onDelete}
                                >
                                  <Trash2 className='h-4 w-4 text-red-600' />
                                </Button>
                              )}
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='h-7 w-7'
                                title='Télécharger'
                                onClick={() => downloadAttachment(ATTACHMENT_FOLDER, row.stored, row.name)}
                              >
                                <Download className='h-4 w-4' />
                              </Button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {uploadError && <p className='col-span-full text-red-600 text-sm'>{uploadError}</p>}
                </>
              </Box>

              <Box icon={Globe} title='Géolocalisation' collapsible={false}>
                <Field label='Latitude' htmlFor='latitude'>
                  <Input
                    id='latitude'
                    type='number'
                    step='0.000001'
                    value={formData.latitude ?? ''}
                    onChange={(e) => handleChange('latitude', numOrNull(e.target.value))}
                    disabled={changeToDetails}
                  />
                </Field>

                <Field label='Longitude' htmlFor='longitude'>
                  <Input
                    id='longitude'
                    type='number'
                    step='0.000001'
                    value={formData.longitude ?? ''}
                    onChange={(e) => handleChange('longitude', numOrNull(e.target.value))}
                    disabled={changeToDetails}
                  />
                </Field>

                <div className='col-span-full space-y-1.5'>
                  <div ref={mapDivRef} className='h-[460px] w-full rounded-lg border bg-muted' />
                  {mapError ? (
                    <p className='text-sm text-gray-500'>Carte indisponible : {mapError}</p>
                  ) : (
                    !changeToDetails && (
                      <p className='text-xs text-gray-500'>
                        Double-cliquez sur la carte pour renseigner la latitude et la longitude ; le repère est déplaçable.
                      </p>
                    )
                  )}
                </div>
              </Box>
            </div>
          </div>
        </form>
      </CardContent>
      <Separator />
      <CardFooter className='flex justify-end gap-2 mt-6'>
        {!changeToDetails && (
          <Button onClick={handleSubmit}>
            <Save />
            Sauvegarder
          </Button>
        )}
        <Button
          variant='outline'
          className='border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary'
          onClick={() =>
            navigate(prospectionId ? `${backPath}?prospection=${prospectionId}` : backPath)
          }
        >
          <ArrowLeft />
          Retour
        </Button>
      </CardFooter>

    </Card>
  );
};

export default Form;
