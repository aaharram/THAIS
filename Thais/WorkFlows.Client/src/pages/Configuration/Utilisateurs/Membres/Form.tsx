import { BaseDialog } from '@/components/dialog/dialog';
import { UnsavedChangesDialog } from '@/components/dialog/unsaved-changes-dialog';
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
import { Switch } from '@/components/ui/switch';
import { Title } from '@/components/ui/title';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { AppDispatch } from '@/store';
import { MembersRequest, MembersRequestSchema } from '@/store/features/members/members-schemas';
import {
  createMembers,
  deleteMembers,
  editMembers,
  getAllMembers,
  getMembersById,
  resetMembers,
  uploadMemberSignature,
} from '@/store/features/members/membersSlice';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { getAllPays } from '@/store/features/pays/paysSlice';
import { getProvincesByCountry } from '@/store/features/provinces/provincesSlice';
import { getVillesByCountry, getVillesByProvince } from '@/store/features/villes/villesSlice';
import { useAppSelector } from '@/store/hooks';
import { AlertCircle, Eye, EyeOff, Info, Upload } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import { cn } from '../../../../utils/lib/utils';

const Form = ({ details }: { details?: boolean }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const navigate = useNavigate();
  const [changeToDetails, setChangeToDetails] = useState<boolean>(details ?? false);
  const { allPays } = useAppSelector((state) => state.pays);
  const { provincesByCountry } = useAppSelector((state) => state.province);
  const { villesByProvince } = useAppSelector((state) => state.villes);
  const { villesByCountry } = useAppSelector((state) => state.villes);
  const { allMembers } = useAppSelector((state) => state.members);
  const { allItems: allServiceProfils } = useAppSelector((state) => state.cfgServiceProfils);

  useEffect(() => {
    dispatch(getAllPays({}));
    dispatch(getAllMembers({ pageSize: 1000 }));
    dispatch(lookupModules.cfgServiceProfils.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  const { members } = useAppSelector((state) => state.members);
  const [showPassword, setShowPassword] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !members) return;
    setSignatureFile(file);
    dispatch(uploadMemberSignature({ id: members.numero, file }));
  };

  const [formData, setFormData] = useState<MembersRequest>({
    addUser: members ? 0 : userId,
    modUser: members ? userId : 0,
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    address: '',
    tel: '',
    noCountry: 0,
    noProvince: 0,
    noCity: 0,
    active: false,
    enabled: true,
    salaireHoraire: null,
    noGestionnaire: null,
    patrimoineType: null,
    gestionMetier: false,
    gestionFinanciere: false,
    gestionAdministrative: false,
  });

  const resetFormFields = () => {
    setFormData({
      addUser: members ? 0 : userId,
      modUser: members ? userId : 0,
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      name: `${formData.firstName} ${formData.lastName}`,
      email: '',
      address: '',
      tel: '',
      noCountry: 0,
      noProvince: 0,
      noCity: 0,
      active: false,
      enabled: true,
      salaireHoraire: null,
      noGestionnaire: null,
      patrimoineType: null,
      gestionMetier: false,
      gestionFinanciere: false,
      gestionAdministrative: false,
    });
  };

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const handleNavigationWithConfirm = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedChangesDialog(true);
    } else {
      navigate(path);
    }
  };

  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      setShowUnsavedChangesDialog(false);
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleSaveAndNavigate = async () => {
    const isValid = validateForm(formData);
    if (isValid) {
      if (members) {
        await dispatch(
          editMembers({
            id: members.numero,
            updatedMembers: formData,
          }),
        ).unwrap();
        dispatch(resetMembers());
      } else {
        await dispatch(createMembers(formData)).unwrap();
      }
      setShowUnsavedChangesDialog(false);
      if (pendingNavigation) {
        navigate(pendingNavigation);
        setPendingNavigation(null);
      }
    }
  };

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id != null) {
      dispatch(getMembersById(Number(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (members) {
      setFormData({
        addUser: members.addUser ?? 0,
        modUser: userId,
        username: members.username ?? '',
        password: members.password ?? '',
        firstName: members.firstName ?? '',
        lastName: members.lastName ?? '',
        name: members.name ?? '',
        email: members.email ?? '',
        address: members.address ?? '',
        tel: members.tel ?? '',
        noCountry: members.noCountry ?? 0,
        noProvince: members.noProvince ?? 0,
        noCity: members.noCity ?? 0,
        active: members.active ?? false,
        enabled: members.enabled ?? true,
        salaireHoraire: members.salaireHoraire ?? null,
        noGestionnaire: members.noGestionnaire ?? null,
        patrimoineType: members.patrimoineType ?? null,
        gestionMetier: members.gestionMetier ?? false,
        gestionFinanciere: members.gestionFinanciere ?? false,
        gestionAdministrative: members.gestionAdministrative ?? false,
      });
    }
  }, [members, userId]);

  useEffect(() => {
    if (members) {
      const initialData = {
        addUser: members.addUser ?? 0,
        modUser: userId,
        username: members.username ?? '',
        password: members.password ?? '',
        firstName: members.firstName ?? '',
        lastName: members.lastName ?? '',
        name: members.name ?? '',
        email: members.email ?? '',
        address: members.address ?? '',
        tel: members.tel ?? '',
        noCountry: members.noCountry ?? 0,
        noProvince: members.noProvince ?? 0,
        noCity: members.noCity ?? 0,
        active: members.active ?? false,
        enabled: members.enabled ?? true,
        salaireHoraire: members.salaireHoraire ?? null,
        noGestionnaire: members.noGestionnaire ?? null,
        patrimoineType: members.patrimoineType ?? null,
        gestionMetier: members.gestionMetier ?? false,
        gestionFinanciere: members.gestionFinanciere ?? false,
        gestionAdministrative: members.gestionAdministrative ?? false,
      };
      setHasUnsavedChanges(JSON.stringify(formData) !== JSON.stringify(initialData));
    } else {
      const initialData = {
        addUser: userId,
        modUser: 0,
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        name: '',
        email: '',
        address: '',
        tel: '',
        noCountry: 0,
        noProvince: 0,
        noCity: 0,
        active: false,
        enabled: true,
        salaireHoraire: null,
        noGestionnaire: null,
        patrimoineType: null,
        gestionMetier: false,
        gestionFinanciere: false,
        gestionAdministrative: false,
      };
      setHasUnsavedChanges(JSON.stringify(formData) !== JSON.stringify(initialData));
    }
  }, [formData, members, userId]);

  useUnsavedChanges(hasUnsavedChanges);

  const handleChange = <T extends keyof MembersRequest>(
    field: T,
    value: MembersRequest[T] | null,
  ) => {
    let updatedFormData = { ...formData };

    if (field === 'noCountry') {
      updatedFormData = {
        ...updatedFormData,
        noCountry: Number(value),
        noProvince: 0,
        noCity: 0,
      };
    } else if (field === 'noProvince') {
      updatedFormData = {
        ...updatedFormData,
        noProvince: Number(value),
        noCity: 0,
      };
    } else {
      updatedFormData = {
        ...updatedFormData,
        [field]: value,
      };
    }

    if (field === 'firstName' || field === 'lastName') {
      updatedFormData.name = `${updatedFormData.firstName} ${updatedFormData.lastName}`;
    }

    setFormData(updatedFormData);
    setHasUnsavedChanges(true);
  };

  const validateForm = (data: MembersRequest) => {
    try {
      MembersRequestSchema.parse(data);
      setErrors({});
      return true;
    } catch (err) {
      const errorMap: { [key: string]: string } = {};
      if (err instanceof z.ZodError) {
        err.errors.forEach((e) => {
          errorMap[e.path[0]] = e.message;
        });
      }
      setErrors(errorMap);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm(formData);
    if (!isValid) return;

    try {
      if (members) {
        await dispatch(
          editMembers({
            id: members.numero,
            updatedMembers: formData,
          }),
        ).unwrap();
        dispatch(resetMembers());
      } else {
        await dispatch(createMembers(formData)).unwrap();
      }

      navigate('/configuration-globale/utilisateurs/membres');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const confirmDelete = () => {
    if (members) {
      dispatch(deleteMembers(members.numero));
      dispatch(resetMembers());
      navigate('/configuration-globale/utilisateurs/membres');
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    if (formData.noCountry) {
      dispatch(getProvincesByCountry({ countryId: formData.noCountry }));
    }
  }, [dispatch, formData.noCountry]);

  useEffect(() => {
    if (formData.noProvince) {
      dispatch(getVillesByProvince({ provinceId: formData.noProvince }));
    } else if (provincesByCountry.length === 0 && formData.noCountry) {
      dispatch(getVillesByCountry({ countryId: formData.noCountry }));
    }
  }, [dispatch, formData.noProvince, formData.noCountry, provincesByCountry]);

  // Déterminer si on est en mode modification
  const isEditMode = members && !changeToDetails;

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle className='flex justify-between'>
          <Title
            title={
              changeToDetails
                ? `Détails du membre ${formData.name}`
                : members
                ? `Modifier le membre ${formData.name}`
                : 'Ajouter un membre'
            }
          />
          {members && (
            <div className='flex justify-end gap-2'>
              <Button onClick={() => setChangeToDetails(!changeToDetails)}>
                {changeToDetails ? 'En Modification' : 'Détails'}
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
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Informations */}
          <div className='border rounded-lg overflow-hidden'>
            <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
              <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
                <Info className='h-4 w-4' />
              </div>
              <h3 className='text-base font-semibold text-gray-900'>Informations</h3>
            </div>

            <div className={`p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 [&_input:not([type=checkbox])]:w-full [&_[role=combobox]]:w-full [&_textarea]:w-full`}>
              <div className='space-y-2'>
                <Label htmlFor='firstName' className='text-sm font-medium'>
                  <span className='text-red-500'>* </span>Prenom
                </Label>
                <Input
                  id='firstName'
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={changeToDetails}
                  className={errors.firstName ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className='text-red-600 text-sm flex items-center gap-1'>
                    <AlertCircle className='h-3 w-3' />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='lastName' className='text-sm font-medium'>
                  Nom
                </Label>
                <Input
                  id='lastName'
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  disabled={changeToDetails}
                  className={errors.lastName ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className='text-red-600 text-sm flex items-center gap-1'>
                    <AlertCircle className='h-3 w-3' />
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='address' className='text-sm font-medium'>
                  Adresse
                </Label>
                <Input
                  id='address'
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={changeToDetails}
                  className={errors.address ? 'border-red-300 focus:border-red-500' : ''}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='tel' className='text-sm font-medium'>
                  Téléphone:
                </Label>
                <Input
                  id='tel'
                  type='tel'
                  value={formData.tel}
                  onChange={(e) => handleChange('tel', e.target.value)}
                  disabled={changeToDetails}
                  className={errors.tel ? 'border-red-300 focus:border-red-500' : ''}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email' className='text-sm font-medium'>
                  <span className='text-red-500'>* </span>Email
                </Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={changeToDetails}
                  className={errors.email ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.email && (
                  <p className='text-red-600 text-sm flex items-center gap-1'>
                    <AlertCircle className='h-3 w-3' />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='patrimoineType' className='text-sm font-medium'>
                  Profil
                </Label>
                <Select
                  value={formData.patrimoineType?.toString() || '0'}
                  onValueChange={(value) =>
                    handleChange('patrimoineType', value === '0' ? null : Number(value))
                  }
                  disabled={changeToDetails}
                >
                  <SelectTrigger id='patrimoineType'>
                    <SelectValue placeholder='Sélectionnez un profil...' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Aucun profil</SelectItem>
                    {allServiceProfils.map((sp) => (
                      <SelectItem key={sp.numero} value={sp.numero.toString()}>
                        {sp.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='username' className='text-sm font-medium'>
                  <span className='text-red-500'>* </span>Identifiant
                </Label>
                <Input
                  id='username'
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  disabled={changeToDetails}
                  className={errors.username ? 'border-red-300 focus:border-red-500' : ''}
                />
              </div>

              {!members && (
                <div className='space-y-2'>
                  <Label htmlFor='password' className='text-sm font-medium'>
                    <span className='text-red-500'>* </span>Mot de passe
                  </Label>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      disabled={changeToDetails}
                      className={cn(
                        errors.password ? 'border-red-300 focus:border-red-500' : '',
                        'pr-10',
                      )}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                    >
                      {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className='text-red-600 text-sm flex items-center gap-1'>
                      <AlertCircle className='h-3 w-3' />
                      {errors.password}
                    </p>
                  )}
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='noGestionnaire' className='text-sm font-medium'>
                  Gestionnaire
                </Label>
                <Select
                  value={formData.noGestionnaire?.toString() || '0'}
                  onValueChange={(value) =>
                    handleChange('noGestionnaire', value === '0' ? null : Number(value))
                  }
                  disabled={changeToDetails}
                >
                  <SelectTrigger id='noGestionnaire'>
                    <SelectValue placeholder='Sélectionnez un gestionnaire...' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Aucun gestionnaire</SelectItem>
                    {allMembers
                      .filter((m) => !members || m.numero !== members.numero)
                      .map((member) => (
                        <SelectItem key={member.numero} value={member.numero.toString()}>
                          {member.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {!isEditMode && (
                <>
                  <div className='space-y-2'>
                    <Label htmlFor='country' className='text-sm font-medium'>
                      Pays
                    </Label>
                    <Select
                      value={formData.noCountry.toString()}
                      onValueChange={(value) => handleChange('noCountry', Number(value))}
                      disabled={changeToDetails}
                    >
                      <SelectTrigger id='country' className={errors.noCountry ? 'border-red-300' : ''}>
                        <SelectValue placeholder='Sélectionnez un pays...' />
                      </SelectTrigger>
                      <SelectContent>
                        {allPays.map((pays) => (
                          <SelectItem key={pays.numero} value={pays.numero.toString()}>
                            {pays.titleF}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='province' className='text-sm font-medium'>
                      Province
                    </Label>
                    <Select
                      value={formData.noProvince.toString()}
                      onValueChange={(value) => handleChange('noProvince', Number(value))}
                      disabled={changeToDetails || !formData.noCountry}
                    >
                      <SelectTrigger id='province' className={errors.noProvince ? 'border-red-300' : ''}>
                        <SelectValue placeholder='Sélectionnez une province...' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='0'>Aucune province</SelectItem>
                        {provincesByCountry.map((province) => (
                          <SelectItem key={province.numero} value={province.numero.toString()}>
                            {province.titleF}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='city' className='text-sm font-medium'>
                      Ville
                    </Label>
                    <Select
                      value={formData.noCity?.toString() || ''}
                      onValueChange={(value) => handleChange('noCity', Number(value))}
                      disabled={
                        changeToDetails || (!formData.noProvince && provincesByCountry.length > 0)
                      }
                    >
                      <SelectTrigger id='city' className={errors.noCity ? 'border-red-300' : ''}>
                        <SelectValue placeholder='Sélectionnez une ville...' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='0'>Aucune ville</SelectItem>
                        {(provincesByCountry.length > 0 ? villesByProvince : villesByCountry).map(
                          (ville) => (
                            <SelectItem key={ville.numero} value={ville.numero.toString()}>
                              {ville.titleF}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='salaireHoraire' className='text-sm font-medium'>
                      Salaire horaire (DH/h)
                    </Label>
                    <Input
                      id='salaireHoraire'
                      type='number'
                      min={0}
                      step='0.01'
                      placeholder='Ex: 45.00'
                      value={formData.salaireHoraire ?? ''}
                      onChange={(e) =>
                        handleChange(
                          'salaireHoraire',
                          e.target.value === '' ? null : Number(e.target.value),
                        )
                      }
                      disabled={changeToDetails}
                    />
                  </div>
                </>
              )}

              {members && (
                <div className='space-y-2 col-span-full sm:col-span-1'>
                  <Label htmlFor='signature' className='text-sm font-medium'>
                    Signature
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='signature'
                      readOnly
                      value={signatureFile?.name ?? members.signatureUrl ?? ''}
                      placeholder='Aucun fichier sélectionné'
                      className='bg-gray-50'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => signatureInputRef.current?.click()}
                      disabled={changeToDetails}
                    >
                      <Upload className='h-4 w-4 mr-2' />
                      Parcourir
                    </Button>
                    <input
                      ref={signatureInputRef}
                      id='signature-file'
                      type='file'
                      accept='.jpg,.jpeg,.png,.gif,.webp'
                      className='hidden'
                      onChange={handleSignatureChange}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className='border rounded-lg overflow-hidden'>
            <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
              <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
                <Info className='h-4 w-4' />
              </div>
              <h3 className='text-base font-semibold text-gray-900'>Options</h3>
            </div>

            <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 [&_input:not([type=checkbox])]:w-full [&_[role=combobox]]:w-full [&_textarea]:w-full'>
              <div>
                <p className='font-semibold text-sm mb-2'>Achat :</p>
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm'>
                    <Checkbox
                      checked={formData.gestionMetier}
                      onCheckedChange={(checked) => handleChange('gestionMetier', checked === true)}
                      disabled={changeToDetails}
                    />
                    Gestion Métier
                  </label>
                  <label className='flex items-center gap-2 text-sm'>
                    <Checkbox
                      checked={formData.gestionFinanciere}
                      onCheckedChange={(checked) =>
                        handleChange('gestionFinanciere', checked === true)
                      }
                      disabled={changeToDetails}
                    />
                    Gestion Production
                  </label>
                  <label className='flex items-center gap-2 text-sm'>
                    <Checkbox
                      checked={formData.gestionAdministrative}
                      onCheckedChange={(checked) =>
                        handleChange('gestionAdministrative', checked === true)
                      }
                      disabled={changeToDetails}
                    />
                    Gestion Administrative
                  </label>
                </div>
              </div>

              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border h-fit'>
                <div className='space-y-0.5'>
                  <Label className='text-sm font-medium'>Statut du compte</Label>
                  <p className='text-xs text-gray-600'>
                    {formData.enabled ? 'Compte actif' : 'Compte désactivé'}
                  </p>
                </div>
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(checked) => handleChange('enabled', checked)}
                  disabled={changeToDetails}
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <Separator />
      <CardFooter className='flex justify-between mt-6'>
        <div className='flex items-center space-x-3'>
          {members && (
            <div className='text-xs sm:text-sm text-gray-700 flex justify-between space-x-2'>
              {members.addUser != null && members.addUser != 0 && (
                <div className='flex items-center space-x-2'>
                  <span className='text-primary font-semibold'>
                    Ajouté par {members.nameAddUser}
                  </span>
                  <span className='text-muted-foreground'>
                    le{' '}
                    {new Date(members.addDate).toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              <Separator orientation='vertical' />
              {members.modUser != null && members.modUser != 0 && (
                <div className='flex items-center space-x-2'>
                  <span className='text-primary font-semibold'>
                    Mis à jour par {members.nameModUser}
                  </span>
                  <span className='text-muted-foreground'>
                    le{' '}
                    {new Date(members.modDate).toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`flex ${
            isMobile ? 'flex-col items-stretch gap-3' : 'flex-row justify-end gap-2'
          }`}
        >
          {!changeToDetails && !members && (
            <Button
              variant='outline'
              onClick={resetFormFields}
              className={isMobile ? 'w-full' : ''}
            >
              Réinitialiser les champs
            </Button>
          )}
          <Button
            variant='secondary'
            onClick={() =>
              handleNavigationWithConfirm('/configuration-globale/utilisateurs/membres')
            }
            className={isMobile ? 'w-full' : ''}
          >
            Précédent
          </Button>
          {!changeToDetails && (
            <Button onClick={handleSubmit} className={isMobile ? 'w-full' : ''}>
              {members ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          )}
        </div>
      </CardFooter>

      <BaseDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Confirmer la suppression'
        description={`Êtes-vous sûr de vouloir retirer le membre "${members?.name || ''}"?`}
      >
        <div className='flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-2'>
          <Button
            variant='outline'
            onClick={() => setDeleteDialogOpen(false)}
            className='w-full sm:w-auto'
          >
            Annuler
          </Button>
          <Button variant='destructive' onClick={confirmDelete} className='w-full sm:w-auto'>
            Retirer
          </Button>
        </div>
      </BaseDialog>

      <UnsavedChangesDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
        onContinueEditing={() => setShowUnsavedChangesDialog(false)}
        onDiscardChanges={handleConfirmNavigation}
        onSaveChanges={handleSaveAndNavigate}
      />
    </Card>
  );
};

export default Form;
