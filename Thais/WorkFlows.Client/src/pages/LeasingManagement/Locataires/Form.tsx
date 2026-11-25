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
import { lookupModules } from '@/store/features/configuration/lookupModules';
import {
  ETATS_DOCUMENT,
  LocataireRequest,
  LocataireRequestSchema,
  TYPES_LOCATAIRE,
} from '@/store/features/leasing/locataire-schemas';
import {
  createLocataire,
  deleteLocataire,
  editLocataire,
  getLocataireById,
  resetLocataire,
} from '@/store/features/leasing/locatairesSlice';
import { useAppSelector } from '@/store/hooks';
import { FileText, Info, Plus, User, Users, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const backPath = '/leasing-management/locataires';

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

const RequiredLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <Label htmlFor={htmlFor} className='text-sm font-medium'>
    <span className='text-red-500'>* </span>
    {children}
  </Label>
);

const emptyForm: LocataireRequest = {
  codeLocataire: '',
  typeLocataire: 0,
  designationEntreprise: '',
  rc: '',
  idF: '',
  noCIN: '',
  ice: '',
  prenom: '',
  nom: '',
  telephone: '',
  email: '',
  adresse: '',
  postalCode: '',
  noCity: null,
  noCountry: null,
  notes: '',
  noBuilding: null,
  noLocal: null,
  statutsDispo: false,
  rcDispo: false,
  pieceIdentiteDispo: false,
  autresDispo: false,
  autreContactNom: '',
  autreContactPrenom: '',
  autreContactTelephone: '',
  autreContactPoste: '',
  autreContactEmail: '',
  inactif: false,
};

const Form = ({ details }: { details?: boolean }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // Sélection de fichier locale uniquement (pas d'infra de stockage côté serveur) : le
  // fichier n'est jamais envoyé au backend, ce champ ne fait que refléter le "Parcourir".
  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [autreDocumentFichier, setAutreDocumentFichier] = useState<File | null>(null);
  const [autresDocuments, setAutresDocuments] = useState<string[]>([]);
  const autreDocumentInputRef = useRef<HTMLInputElement | null>(null);

  const item = useAppSelector((state: RootState) => state.locataires.item);
  const { allItems: villes } = useAppSelector((state) => state.cfgVilles);
  const { allItems: paysList } = useAppSelector((state) => state.cfgPays);

  const [formData, setFormData] = useState<LocataireRequest>({
    ...emptyForm,
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    dispatch(lookupModules.cfgVilles.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgPays.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getLocataireById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        codeLocataire: item.codeLocataire ?? '',
        typeLocataire: item.typeLocataire,
        designationEntreprise: item.designationEntreprise ?? '',
        rc: item.rc ?? '',
        idF: item.idF ?? '',
        noCIN: item.noCIN ?? '',
        ice: item.ice ?? '',
        prenom: item.prenom ?? '',
        nom: item.nom ?? '',
        telephone: item.telephone ?? '',
        email: item.email ?? '',
        adresse: item.adresse ?? '',
        postalCode: item.postalCode ?? '',
        noCity: item.noCity ?? null,
        noCountry: item.noCountry ?? null,
        notes: item.notes ?? '',
        noBuilding: item.noBuilding ?? null,
        noLocal: item.noLocal ?? null,
        statutsDispo: item.statutsDispo,
        rcDispo: item.rcDispo,
        pieceIdentiteDispo: item.pieceIdentiteDispo,
        autresDispo: item.autresDispo,
        autreContactNom: item.autreContactNom ?? '',
        autreContactPrenom: item.autreContactPrenom ?? '',
        autreContactTelephone: item.autreContactTelephone ?? '',
        autreContactPoste: item.autreContactPoste ?? '',
        autreContactEmail: item.autreContactEmail ?? '',
        inactif: item.inactif,
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof LocataireRequest>(field: T, value: LocataireRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (data: LocataireRequest) => {
    try {
      LocataireRequestSchema.parse(data);
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
      await dispatch(editLocataire({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetLocataire());
    } else {
      await dispatch(createLocataire(formData)).unwrap();
    }

    navigate(backPath);
  };

  const confirmDelete = () => {
    if (item) {
      dispatch(deleteLocataire(item.numero));
      dispatch(resetLocataire());
      navigate(backPath);
      setDeleteDialogOpen(false);
    }
  };

  const tauxAvancement = Math.round(
    ([formData.statutsDispo, formData.rcDispo, formData.pieceIdentiteDispo, formData.autresDispo].filter(Boolean)
      .length *
      100) /
      4,
  );

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle className='flex justify-between'>
          <Title
            title={
              changeToDetails
                ? `Détails "${item?.nomAffiche ?? ''}"`
                : item
                ? `Modifier "${item.nomAffiche}"`
                : 'Ajouter un locataire'
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
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        {Object.keys(errors).length > 0 && (
          <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
            {Object.values(errors).join(' ')}
          </div>
        )}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <Section icon={Users} title='Locataire'>
            <div className='space-y-2'>
              <Label htmlFor='codeLocataire' className='text-sm font-medium'>
                Code Locataire
              </Label>
              <Input
                id='codeLocataire'
                value={formData.codeLocataire ?? ''}
                onChange={(e) => handleChange('codeLocataire', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <RequiredLabel htmlFor='typeLocataire'>Type</RequiredLabel>
              <Select
                value={formData.typeLocataire.toString()}
                onValueChange={(value) => handleChange('typeLocataire', Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='typeLocataire'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_LOCATAIRE.map((t) => (
                    <SelectItem key={t.value} value={t.value.toString()}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='designationEntreprise' className='text-sm font-medium'>
                Raison sociale
              </Label>
              <Input
                id='designationEntreprise'
                value={formData.designationEntreprise ?? ''}
                onChange={(e) => handleChange('designationEntreprise', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='rc' className='text-sm font-medium'>
                RC
              </Label>
              <Input
                id='rc'
                value={formData.rc ?? ''}
                onChange={(e) => handleChange('rc', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='idF' className='text-sm font-medium'>
                IF
              </Label>
              <Input
                id='idF'
                value={formData.idF ?? ''}
                onChange={(e) => handleChange('idF', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <RequiredLabel htmlFor='noCIN'>CIN</RequiredLabel>
              <Input
                id='noCIN'
                value={formData.noCIN ?? ''}
                onChange={(e) => handleChange('noCIN', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <RequiredLabel htmlFor='ice'>ICE</RequiredLabel>
              <Input
                id='ice'
                value={formData.ice ?? ''}
                onChange={(e) => handleChange('ice', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='prenom' className='text-sm font-medium'>
                Prénom
              </Label>
              <Input
                id='prenom'
                value={formData.prenom ?? ''}
                onChange={(e) => handleChange('prenom', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='nom' className='text-sm font-medium'>
                Nom
              </Label>
              <Input
                id='nom'
                value={formData.nom ?? ''}
                onChange={(e) => handleChange('nom', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='telephone' className='text-sm font-medium'>
                Téléphone
              </Label>
              <Input
                id='telephone'
                value={formData.telephone ?? ''}
                onChange={(e) => handleChange('telephone', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium'>
                Email
              </Label>
              <Input
                id='email'
                value={formData.email ?? ''}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='adresse' className='text-sm font-medium'>
                Adresse
              </Label>
              <Input
                id='adresse'
                value={formData.adresse ?? ''}
                onChange={(e) => handleChange('adresse', e.target.value)}
                disabled={changeToDetails}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='postalCode' className='text-sm font-medium'>
                Code postal
              </Label>
              <Input
                id='postalCode'
                value={formData.postalCode ?? ''}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='noCity' className='text-sm font-medium'>
                Ville
              </Label>
              <Select
                value={formData.noCity?.toString() || '0'}
                onValueChange={(value) => handleChange('noCity', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noCity'>
                  <SelectValue placeholder='Sélectionnez...' />
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
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noCountry' className='text-sm font-medium'>
                Pays
              </Label>
              <Select
                value={formData.noCountry?.toString() || '0'}
                onValueChange={(value) => handleChange('noCountry', value === '0' ? null : Number(value))}
                disabled={changeToDetails}
              >
                <SelectTrigger id='noCountry'>
                  <SelectValue placeholder='Sélectionnez...' />
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
            </div>
            <div />

            <div className='space-y-2 col-span-full'>
              <Label htmlFor='notes' className='text-sm font-medium'>
                Note
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

          <div className='border rounded-lg overflow-hidden'>
            <div className='bg-gray-50 px-4 py-3 flex items-center justify-between gap-2 border-b'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
                  <FileText className='h-4 w-4' />
                </div>
                <h3 className='text-base font-semibold text-gray-900'>Dossier Administratif</h3>
              </div>
              <span className='inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700'>
                Taux d'avancement {tauxAvancement}%
              </span>
            </div>
            <div className='p-4 sm:p-6 overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='text-left text-gray-500 border-b'>
                    <th className='py-2 pr-4 font-medium'>Documents</th>
                    <th className='py-2 pr-4 font-medium'>Etat du document</th>
                    <th className='py-2 font-medium'>Joindre le document</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      { key: 'statutsDispo', label: 'Statuts' },
                      { key: 'rcDispo', label: 'RC' },
                      { key: 'pieceIdentiteDispo', label: 'Copie CIN' },
                      { key: 'autresDispo', label: 'Autres documents' },
                    ] as const
                  ).map((row) => (
                    <tr key={row.key} className='border-b last:border-b-0'>
                      <td className='py-3 pr-4'>{row.label}</td>
                      <td className='py-3 pr-4'>
                        <Select
                          value={formData[row.key] ? 'true' : 'false'}
                          onValueChange={(value) => handleChange(row.key, value === 'true')}
                          disabled={changeToDetails}
                        >
                          <SelectTrigger className='w-48'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ETATS_DOCUMENT.map((e) => (
                              <SelectItem key={e.label} value={e.value.toString()}>
                                {e.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className='py-3'>
                        <div className='flex items-center gap-2'>
                          <Input
                            readOnly
                            value={documentFiles[row.key]?.name ?? ''}
                            placeholder='Aucun fichier sélectionné'
                            className='bg-gray-50 text-gray-500'
                          />
                          <Button
                            type='button'
                            variant='outline'
                            disabled={changeToDetails}
                            onClick={() => fileInputRefs.current[row.key]?.click()}
                          >
                            Parcourir
                          </Button>
                          <input
                            type='file'
                            ref={(el) => {
                              fileInputRefs.current[row.key] = el;
                            }}
                            className='hidden'
                            onChange={(e) =>
                              setDocumentFiles((prev) => ({ ...prev, [row.key]: e.target.files?.[0] ?? null }))
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Section icon={User} title='Autre Contact'>
            <div className='space-y-2'>
              <Label htmlFor='autreContactPrenom' className='text-sm font-medium'>
                Prénom
              </Label>
              <Input
                id='autreContactPrenom'
                value={formData.autreContactPrenom ?? ''}
                onChange={(e) => handleChange('autreContactPrenom', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='autreContactNom' className='text-sm font-medium'>
                Nom
              </Label>
              <Input
                id='autreContactNom'
                value={formData.autreContactNom ?? ''}
                onChange={(e) => handleChange('autreContactNom', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='autreContactPoste' className='text-sm font-medium'>
                Code postal
              </Label>
              <Input
                id='autreContactPoste'
                value={formData.autreContactPoste ?? ''}
                onChange={(e) => handleChange('autreContactPoste', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='autreContactTelephone' className='text-sm font-medium'>
                Téléphone
              </Label>
              <Input
                id='autreContactTelephone'
                value={formData.autreContactTelephone ?? ''}
                onChange={(e) => handleChange('autreContactTelephone', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='autreContactEmail' className='text-sm font-medium'>
                Email
              </Label>
              <Input
                id='autreContactEmail'
                value={formData.autreContactEmail ?? ''}
                onChange={(e) => handleChange('autreContactEmail', e.target.value)}
                disabled={changeToDetails}
              />
            </div>
          </Section>

          <div className='border rounded-lg overflow-hidden'>
            <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
              <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
                <FileText className='h-4 w-4' />
              </div>
              <h3 className='text-base font-semibold text-gray-900'>Autre documents</h3>
            </div>
            <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='autreDocumentFichier' className='text-sm font-medium'>
                  Fichier
                </Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id='autreDocumentFichier'
                    readOnly
                    value={autreDocumentFichier?.name ?? ''}
                    placeholder='Aucun fichier sélectionné'
                    className='bg-gray-50 text-gray-500'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    disabled={changeToDetails}
                    onClick={() => autreDocumentInputRef.current?.click()}
                  >
                    Parcourir
                  </Button>
                  <input
                    type='file'
                    ref={autreDocumentInputRef}
                    className='hidden'
                    onChange={(e) => setAutreDocumentFichier(e.target.files?.[0] ?? null)}
                  />
                  <Button
                    type='button'
                    size='icon'
                    disabled={changeToDetails || !autreDocumentFichier}
                    onClick={() => {
                      if (!autreDocumentFichier) return;
                      setAutresDocuments((prev) => [...prev, autreDocumentFichier.name]);
                      setAutreDocumentFichier(null);
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
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Confirmer la suppression'
        description={`Êtes-vous sûr de vouloir désactiver "${item?.nomAffiche ?? ''}" ?`}
      >
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
            Annuler
          </Button>
          <Button variant='destructive' onClick={confirmDelete}>
            Désactiver
          </Button>
        </div>
      </BaseDialog>
    </Card>
  );
};

export default Form;
