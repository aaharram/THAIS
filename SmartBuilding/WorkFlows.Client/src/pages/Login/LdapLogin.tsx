import { AppLogo } from '@/components/brand/AppLogo';
import { APP_TAGLINE } from '@/components/brand/company';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppDispatch } from '@/store';
import {
  loginSchema,
  resetPasswordSchema,
  type LoginSchema,
  type ResetPasswordSchema,
} from '@/store/features/authentification/auth-schemas';
import { firstResetPassword, login } from '@/store/features/authentification/authSlice';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/utils/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '../../components/ui/checkbox';
export default function LdapLogin({ className, ...props }: React.ComponentProps<'div'>) {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(false);

  const loginForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', isLdap: true, rememberMe: false },
  });

  const resetForm = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { username: '', newPassword: '', confirmPassword: '' },
  });

  const handleBackToLogin = () => {
    setRequiresPasswordReset(false);
    loginForm.reset();
    resetForm.reset();
  };

  async function onSubmitLogin(data: LoginSchema) {
    try {
      const result = await dispatch(
        login({
          username: data.username,
          password: data.password,
          isLdap: true,
          rememberMe: data.rememberMe,
        }),
      );
      if (
        login.rejected.match(result) &&
        result.payload &&
        typeof result.payload === 'object' &&
        'requiresPasswordReset' in result.payload
      ) {
        setRequiresPasswordReset(true);
        resetForm.setValue('username', data.username);
      }
    } catch (error) {
      console.error('Error occurred during login:', error);
    }
  }

  async function onSubmitReset(data: ResetPasswordSchema) {
    try {
      const result = await dispatch(
        firstResetPassword({ username: data.username, newPassword: data.newPassword }),
      );
      if (firstResetPassword.fulfilled.match(result)) {
        setRequiresPasswordReset(false);
        await dispatch(
          login({
            username: data.username,
            password: data.newPassword,
            isLdap: true,
            rememberMe: false,
          }),
        );
      }
    } catch (error) {
      console.error('Error occurred during password reset:', error);
    }
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10'>
      <div className='w-full max-w-sm md:max-w-3xl'>
        <div className={cn('flex flex-col gap-6', className)} {...props}>
          <Card className='overflow-hidden'>
            <CardContent className='grid p-0 md:grid-cols-2'>
              <>
                {isMobile ? (
                  <div className='flex flex-col items-center p-4 gap-1'>
                    <AppLogo className='w-16 h-16 shadow-sm' />
                    <h1 className='text-xl font-bold text-[130%]'>THAIS</h1>
                    <p className='text-sm text-muted-foreground'>{APP_TAGLINE}</p>
                    <h2 className='text-lg font-semibold mr-[11%] my-2'>
                      Connectez-vous à votre compte
                    </h2>
                    <form
                      onSubmit={loginForm.handleSubmit(onSubmitLogin)}
                      className='w-full space-y-4'
                    >
                      <div className='relative space-y-2'>
                        <Label htmlFor='username'>Nom d'utilisateur</Label>
                        <div className='relative'>
                          <User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c2c3cd]' />
                          <Input
                            id='username'
                            {...loginForm.register('username')}
                            disabled={loading}
                            placeholder="Entrez votre nom d'utilisateur"
                            className='pl-8 placeholder:text-[#c2c3cd] border-[#c2c3cd] focus:ring-1 focus:ring-[#c2c3cd] focus:border-[#c2c3cd]'
                          />
                        </div>
                        {loginForm.formState.errors.username && (
                          <p className='text-sm text-destructive'>
                            {loginForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor='password'>Mot de passe</Label>
                        <div className='relative space-y-2'>
                          {' '}
                          {/* New wrapper div */}
                          <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c2c3cd]' />
                          <Input
                            id='password'
                            type='password'
                            {...loginForm.register('password')}
                            disabled={loading}
                            placeholder='Entrez votre mot de passe'
                            className='pl-8 placeholder:text-[#c2c3cd] border-[#c2c3cd] focus:ring-1 focus:ring-[#c2c3cd] focus:border-[#c2c3cd]'
                          />
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className='text-sm text-destructive'>
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                        <span
                          className='block text-right text-sm text-[#7D7F8A] underline-offset-2 hover:underline mt-2 cursor-pointer'
                          onClick={() => navigate('/reset-password')}
                        >
                          Mot de passe oublié ?
                        </span>
                      </div>
                      {error && (
                        <p className='text-sm text-destructive text-center'>
                          {typeof error === 'string' ? error : 'Une erreur est survenue'}
                        </p>
                      )}
                      <Button type='submit' className='w-full' disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className='p-6 md:p-8'>
                    {requiresPasswordReset ? (
                      <form onSubmit={resetForm.handleSubmit(onSubmitReset)}>
                        <div className='flex flex-col gap-6'>
                          <div className='flex flex-col items-center text-center'>
                            <AppLogo className='h-10 w-10 mb-2 md:hidden' />
                            <h1 className='hidden md:block text-2xl font-bold'>THAIS</h1>
                            <p className='text-balance text-muted-foreground'>Première connexion</p>
                            <p className='text-sm text-muted-foreground mt-2'>
                              Veuillez définir votre nouveau mot de passe
                            </p>
                          </div>
                          <input type='hidden' {...resetForm.register('username')} />
                          <div className='grid gap-2'>
                            <Label htmlFor='newPassword'>Nouveau mot de passe</Label>
                            <Input
                              id='newPassword'
                              type='password'
                              {...resetForm.register('newPassword')}
                              disabled={loading}
                              placeholder='Entrez votre nouveau mot de passe'
                            />
                            {resetForm.formState.errors.newPassword && (
                              <p className='text-sm text-destructive'>
                                {resetForm.formState.errors.newPassword.message}
                              </p>
                            )}
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='confirmPassword'>Confirmer le mot de passe</Label>
                            <Input
                              id='confirmPassword'
                              type='password'
                              {...resetForm.register('confirmPassword')}
                              disabled={loading}
                              placeholder='Confirmez votre nouveau mot de passe'
                            />
                            {resetForm.formState.errors.confirmPassword && (
                              <p className='text-sm text-destructive'>
                                {resetForm.formState.errors.confirmPassword.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className='flex flex-col mt-6'>
                          {error && (
                            <p className='text-sm text-destructive text-center'>
                              {typeof error === 'string' ? error : 'Une erreur est survenue'}
                            </p>
                          )}
                          <div className='mt-2 flex gap-2'>
                            <Button
                              variant='outline'
                              type='button'
                              className='w-full'
                              disabled={loading}
                              onClick={handleBackToLogin}
                            >
                              Retour
                            </Button>
                            <Button type='submit' className='w-full' disabled={loading}>
                              {loading ? 'Traitement...' : 'Enregistrer'}
                            </Button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={loginForm.handleSubmit(onSubmitLogin)}>
                        <div className='flex flex-col gap-6'>
                          <div className='flex flex-col items-center text-center'>
                            <AppLogo className='h-40 w-40 mb-2 md:hidden mx-auto' />
                            <h1 className='hidden md:block text-2xl font-bold'>THAIS</h1>
                            <p className='text-balance text-muted-foreground'>
                              Connectez-vous à votre compte THAIS
                            </p>
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='username'>Code Utilisateur</Label>
                            <Input
                              id='username'
                              className='w-auto'
                              {...loginForm.register('username')}
                              disabled={loading}
                              placeholder='Entrez votre code utilisateur'
                            />
                            {loginForm.formState.errors.username && (
                              <p className='text-sm text-destructive'>
                                {loginForm.formState.errors.username.message}
                              </p>
                            )}
                          </div>
                          <div className='grid gap-2'>
                            <div className='flex items-center'>
                              <Label htmlFor='password'>Mot de passe</Label>
                            </div>
                            <Input
                              id='password'
                              type='password'
                              className='w-auto'
                              {...loginForm.register('password')}
                              disabled={loading}
                              placeholder='Entrez votre mot de passe'
                            />
                            {loginForm.formState.errors.password && (
                              <p className='text-sm text-destructive'>
                                {loginForm.formState.errors.password.message}
                              </p>
                            )}
                            <span
                              className='block text-right text-sm text-[#7D7F8A] underline-offset-2 hover:underline mt-1 cursor-pointer'
                              onClick={() => navigate('/reset-password')}
                            >
                              Mot de passe oublié ?
                            </span>
                          </div>
                        </div>
                        <div className='flex flex-col mt-2'>
                          <div className='flex items-center space-x-2 m-1'>
                            <Checkbox
                              id='rememberMe'
                              checked={loginForm.watch('rememberMe')}
                              onCheckedChange={(checked: boolean) =>
                                loginForm.setValue('rememberMe', checked)
                              }
                            />
                            <Label htmlFor='rememberMe' className='text-sm font-normal'>
                              Se souvenir de moi
                            </Label>
                          </div>
                          {error && (
                            <p className='text-sm text-destructive text-center'>
                              {typeof error === 'string' ? error : 'Une erreur est survenue'}
                            </p>
                          )}
                          <div className='mt-2'>
                            <Button type='submit' className='w-full' disabled={loading}>
                              {loading ? 'Connexion...' : 'Se connecter'}
                            </Button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </>
              <div className='relative hidden bg-muted md:flex md:items-center md:justify-center p-10'>
                <AppLogo className='h-48 w-48' />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
