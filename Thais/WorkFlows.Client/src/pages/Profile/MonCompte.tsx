import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Title } from '@/components/ui/title';
import { api } from '@/store/services/authConfig';
import { API_BASE_URL } from '@/store/services/api';
import { getMyProfile, updateMyProfile, uploadMyProfilePhoto } from '@/store/features/profile/profileSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Camera, Save, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const empty = {
  firstName: '',
  lastName: '',
  email: '',
  tel: '',
  address: '',
};

function MonCompte() {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.profile);
  const [form, setForm] = useState(empty);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        tel: profile.tel ?? '',
        address: profile.address ?? '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!profile?.urlPicture) {
      setPhotoUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    api
      .get(`${API_BASE_URL}/api/profile/${profile.numero}/photo`, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setPhotoUrl(objectUrl);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [profile?.urlPicture, profile?.numero]);

  const set = (field: keyof typeof empty, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await dispatch(uploadMyProfilePhoto(file));
    setUploading(false);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    await dispatch(
      updateMyProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        tel: form.tel,
        address: form.address,
      }),
    );
  };

  const isValid = form.firstName.trim() && form.lastName.trim() && form.email.trim();

  return (
    <div className='mx-auto w-full max-w-4xl space-y-5 [&_input]:w-full'>
      <Title title='Mon compte' description='Gérer vos informations personnelles' />

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base flex items-center gap-2'>
            <User className='w-4 h-4 text-primary' />
            Photo de profil
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className='pt-5'>
          <div className='flex items-center gap-4'>
            <Avatar className='w-20 h-20 rounded-lg'>
              <AvatarImage src={photoUrl ?? undefined} alt={profile?.name} />
              <AvatarFallback className='rounded-lg bg-muted text-muted-foreground'>
                <User className='h-9 w-9' />
              </AvatarFallback>
            </Avatar>
            <div className='space-y-1'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/png,image/jpeg,image/gif,image/webp'
                className='hidden'
                onChange={handlePhotoChange}
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className='w-4 h-4 mr-1' />
                {uploading ? 'Envoi...' : 'Changer la photo'}
              </Button>
              <p className='text-xs text-muted-foreground'>JPG, PNG, GIF ou WebP.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base flex items-center gap-2'>
            <User className='w-4 h-4 text-primary' />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className='pt-5 space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5'>
            <div className='space-y-1'>
              <Label>Nom d'utilisateur</Label>
              <Input value={profile?.username ?? ''} disabled />
            </div>
            <div className='space-y-1'>
              <Label>Rôle</Label>
              <Input value={profile?.role ?? ''} disabled />
            </div>
            <div className='space-y-1'>
              <Label>Gestionnaire</Label>
              <Input value={profile?.nomGestionnaire ?? ''} disabled />
            </div>
            <div className='space-y-1'>
              <Label>Type de profil</Label>
              <Input value={profile?.nomPatrimoineType ?? ''} disabled />
            </div>
            <div className='space-y-1'>
              <Label>
                Prénom <span className='text-destructive'>*</span>
              </Label>
              <Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
            </div>
            <div className='space-y-1'>
              <Label>
                Nom <span className='text-destructive'>*</span>
              </Label>
              <Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
            </div>
            <div className='space-y-1'>
              <Label>
                Email <span className='text-destructive'>*</span>
              </Label>
              <Input type='email' value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className='space-y-1'>
              <Label>Téléphone</Label>
              <Input value={form.tel} onChange={(e) => set('tel', e.target.value)} />
            </div>
            <div className='space-y-1 md:col-span-2'>
              <Label>Adresse</Label>
              <Input value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end gap-2'>
        <Button onClick={handleSubmit} disabled={!isValid || loading}>
          <Save className='w-4 h-4 mr-1' />
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

export default MonCompte;
