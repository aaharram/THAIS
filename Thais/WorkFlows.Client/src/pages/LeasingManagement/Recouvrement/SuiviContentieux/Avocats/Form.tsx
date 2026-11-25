import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Title } from '@/components/ui/title';
import { AppDispatch, RootState } from '@/store';
import { AvocatRequest, AvocatRequestSchema } from '@/store/features/leasing/avocat-schemas';
import { createAvocat, editAvocat, getAvocatById, resetAvocat } from '@/store/features/leasing/avocatSlice';
import { useAppSelector } from '@/store/hooks';
import { downloadAttachment, uploadAttachment } from '@/store/services/attachments';
import { Download, FolderOpen, Info, Loader2, Scale, ArrowLeft, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const ATTACHMENT_FOLDER = 'avocats';

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

const Form = () => {
  const { id, avocatId } = useParams();
  const noContentieux = Number(id);
  const backPath = `/leasing-management/recouvrement/suivi-contentieux/${id}/avocats`;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const item = useAppSelector((state: RootState) => state.avocat.item);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AvocatRequest>({
    noContentieux,
    nom: '',
    prenom: '',
    cabinet: '',
    contrat: '',
    pieceJointe: '',
    addUser: item ? undefined : userId,
    modUser: item ? userId : undefined,
  });

  useEffect(() => {
    if (avocatId) {
      dispatch(getAvocatById(Number(avocatId)));
    }
  }, [avocatId, dispatch]);

  useEffect(() => {
    if (item) {
      setFormData({
        addUser: item.addUser ?? undefined,
        modUser: userId,
        noContentieux: item.noContentieux,
        nom: item.nom ?? '',
        prenom: item.prenom ?? '',
        cabinet: item.cabinet ?? '',
        contrat: item.contrat ?? '',
        pieceJointe: item.pieceJointe ?? '',
      });
    }
  }, [item, userId]);

  const handleChange = <T extends keyof AvocatRequest>(field: T, value: AvocatRequest[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const fileName = await uploadAttachment(ATTACHMENT_FOLDER, file);
      handleChange('pieceJointe', fileName);
    } catch {
      setUploadError("Échec de l'envoi du fichier.");
    } finally {
      setUploading(false);
    }
  };

  const validate = (data: AvocatRequest) => {
    try {
      AvocatRequestSchema.parse(data);
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
      await dispatch(editAvocat({ id: item.numero, updatedItem: formData })).unwrap();
      dispatch(resetAvocat());
    } else {
      await dispatch(createAvocat(formData)).unwrap();
    }

    navigate(backPath);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>
          <Title icon={Scale} title={item ? 'Modifier avocat' : 'Ajouter un avocat'} />
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className='py-6 px-4 sm:px-6 space-y-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <Section icon={Scale} title='Informations'>
            <div className='space-y-2'>
              <Label htmlFor='nom' className='text-sm font-medium'>
                Nom
              </Label>
              <Input
                id='nom'
                value={formData.nom ?? ''}
                onChange={(e) => handleChange('nom', e.target.value)}
                className={errors.nom ? 'border-red-300' : ''}
              />
              {errors.nom && <p className='text-red-600 text-sm'>{errors.nom}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='prenom' className='text-sm font-medium'>
                Prénom
              </Label>
              <Input id='prenom' value={formData.prenom ?? ''} onChange={(e) => handleChange('prenom', e.target.value)} />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='cabinet' className='text-sm font-medium'>
                Cabinet
              </Label>
              <Input id='cabinet' value={formData.cabinet ?? ''} onChange={(e) => handleChange('cabinet', e.target.value)} />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='contrat' className='text-sm font-medium'>
                Contrat
              </Label>
              <Input id='contrat' value={formData.contrat ?? ''} onChange={(e) => handleChange('contrat', e.target.value)} />
            </div>

            {/* RMANew (champ "Pieces jointe") : stockage physique + nom généré en base,
                sur le même modèle que ProfileController (photo de profil). */}
            <div className='space-y-2'>
              <Label htmlFor='pieceJointe' className='text-sm font-medium'>
                Pieces jointe
              </Label>
              <div className='relative w-full'>
                <input
                  id='pieceJointe'
                  readOnly
                  value={formData.pieceJointe ?? ''}
                  className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-40 text-base shadow-sm md:text-sm'
                />
                <div className='absolute inset-y-0 right-1 flex items-center gap-1'>
                  {formData.pieceJointe && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      title='Télécharger'
                      onClick={() => downloadAttachment(ATTACHMENT_FOLDER, formData.pieceJointe!)}
                    >
                      <Download className='h-4 w-4' />
                    </Button>
                  )}
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? <Loader2 className='h-4 w-4 mr-1 animate-spin' /> : <FolderOpen className='h-4 w-4 mr-1' />}
                    Parcourir
                  </Button>
                </div>
                <input ref={fileInputRef} type='file' className='hidden' onChange={handleFileSelected} />
              </div>
              {uploadError && <p className='text-red-600 text-sm'>{uploadError}</p>}
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
        <Button onClick={handleSubmit}><Save />{item ? 'Mettre à jour' : 'Sauvegarder'}</Button>
      </CardFooter>
    </Card>
  );
};

export default Form;
