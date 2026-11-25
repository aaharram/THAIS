import { COMPANY_NAME, COMPANY_URL } from '@/components/brand/company';
import { ThemePicker } from '@/components/theme/theme-picker';
import { Button } from '@/components/ui/button';
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
import { Lock, LogIn, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '../../components/ui/checkbox';

export default function Login({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(false);

  const loginForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', rememberMe: false },
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
      const result = await dispatch(login(data));
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
            rememberMe: false,
          }),
        );
      }
    } catch (error) {
      console.error('Error occurred during password reset:', error);
    }
  }

  // Champs en pilule avec icône ; focus framboise (le petit triangle du logo).
  const inputClass =
    'w-full h-12 pl-11 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 ' +
    'focus-visible:border-[#a81254] focus-visible:ring-2 focus-visible:ring-[#a81254]/20 focus-visible:ring-offset-0';
  const primaryButton =
    'h-12 rounded-lg text-white font-semibold gap-2 shadow-[0_10px_24px_-8px_rgba(168,18,84,0.55)] ' +
    'bg-gradient-to-r from-[#a81254] to-[#1b1b3a] hover:brightness-110 hover:-translate-y-px transition ' +
    'focus-visible:ring-2 focus-visible:ring-[#a81254]/40 focus-visible:ring-offset-2';

  return (
    <div
      className={cn('login-page relative min-h-screen w-full flex flex-col overflow-hidden px-4', className)}
      style={{
        fontFamily: "'Schibsted Grotesk', system-ui, sans-serif",
        backgroundColor: '#f4f1f7',
        backgroundImage: 'linear-gradient(120deg, #ffffff 0%, #f3eff7 50%, #e9dbe7 100%)',
      }}
      {...props}
    >
      {/* Immeubles (public/login-building.jpg) : calque plein écran, agrandi pour rogner les marges blanches de l'image. */}
      <img
        src='/login-building.jpg'
        alt=''
        aria-hidden='true'
        className='login-bg-img pointer-events-none absolute inset-0 h-full w-full select-none mix-blend-multiply object-cover object-[50%_60%] scale-[1.18] origin-[50%_60%]'
      />

      {/* Choix du thème (même liste que « Apparence » dans le menu du compte), en haut à droite */}
      <div className='absolute right-4 top-4 z-20'>
        <ThemePicker />
      </div>

      {/* Halos de couleur aux angles (statiques) */}
      <div aria-hidden='true' className='pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#a81254]/15 blur-3xl' />
      <div aria-hidden='true' className='pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[#2b2b6e]/15 blur-3xl' />

      {/* ════ Carte (centrée dans l'espace restant) ════ */}
      <main className='relative z-10 flex flex-1 items-center justify-center py-10'>
      <div className='login-card w-full max-w-[780px] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(27,27,58,0.35)] grid md:grid-cols-2'>
        {/* ── Formulaire ── */}
        <div className='flex flex-col justify-center px-8 py-12 sm:px-10'>
          <div className='flex justify-center'>
            <img src='/logo-thais-couleur.png' alt='THAIS' className='h-11 w-auto' />
          </div>

          {requiresPasswordReset ? (
            <form onSubmit={resetForm.handleSubmit(onSubmitReset)} className='mt-8'>
              <h1 className='text-center text-2xl font-extrabold tracking-tight text-[#1b1b3a]'>Première connexion</h1>
              <p className='mt-2 text-center text-sm text-slate-500'>Choisissez votre mot de passe pour accéder à THAIS.</p>

              <input type='hidden' {...resetForm.register('username')} />

              <div className='mt-8 space-y-4'>
                <div>
                  <div className='relative'>
                    <Lock className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a81254]' />
                    <Input
                      id='newPassword'
                      type='password'
                      autoComplete='new-password'
                      placeholder='Nouveau mot de passe'
                      aria-label='Nouveau mot de passe'
                      disabled={loading}
                      className={inputClass}
                      {...resetForm.register('newPassword')}
                    />
                  </div>
                  {resetForm.formState.errors.newPassword && (
                    <p className='mt-1 px-4 text-sm text-red-600'>{resetForm.formState.errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <div className='relative'>
                    <Lock className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a81254]' />
                    <Input
                      id='confirmPassword'
                      type='password'
                      autoComplete='new-password'
                      placeholder='Confirmer le mot de passe'
                      aria-label='Confirmer le mot de passe'
                      disabled={loading}
                      className={inputClass}
                      {...resetForm.register('confirmPassword')}
                    />
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className='mt-1 px-4 text-sm text-red-600'>{resetForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {error && (
                <p role='alert' className='mt-4 text-center text-sm text-red-600'>
                  {typeof error === 'string' ? error : 'Une erreur est survenue'}
                </p>
              )}

              <div className='mt-6 flex gap-3'>
                <Button
                  variant='outline'
                  type='button'
                  className='h-12 w-1/3 rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50'
                  disabled={loading}
                  onClick={handleBackToLogin}
                >
                  Retour
                </Button>
                <Button type='submit' className={cn(primaryButton, 'w-2/3')} disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className='mt-8'>
              <h1 className='sr-only'>THAIS</h1>
              <p className='mx-auto mt-1 max-w-[16rem] text-center text-sm text-slate-500'>
                Connectez-vous avec votre compte professionnel
              </p>

              <div className='mt-8 space-y-4'>
                <div>
                  <div className='relative'>
                    <User className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a81254]' />
                    <Input
                      id='username'
                      type='text'
                      autoComplete='username'
                      placeholder='Code utilisateur'
                      aria-label='Code utilisateur'
                      disabled={loading}
                      className={inputClass}
                      {...loginForm.register('username')}
                    />
                  </div>
                  {loginForm.formState.errors.username && (
                    <p className='mt-1 px-4 text-sm text-red-600'>{loginForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div>
                  <div className='relative'>
                    <Lock className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a81254]' />
                    <Input
                      id='password'
                      type='password'
                      autoComplete='current-password'
                      placeholder='Mot de passe'
                      aria-label='Mot de passe'
                      disabled={loading}
                      className={inputClass}
                      {...loginForm.register('password')}
                    />
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className='mt-1 px-4 text-sm text-red-600'>{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className='mt-4 flex items-center justify-between px-1'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='rememberMe'
                    checked={loginForm.watch('rememberMe')}
                    onCheckedChange={(checked: boolean) => loginForm.setValue('rememberMe', checked)}
                    className='border-slate-400 data-[state=checked]:bg-[#a81254] data-[state=checked]:border-[#a81254]'
                  />
                  <Label htmlFor='rememberMe' className='whitespace-nowrap text-[13px] font-normal text-slate-600 select-none cursor-pointer'>
                    Se souvenir de moi
                  </Label>
                </div>
                <button
                  type='button'
                  className='whitespace-nowrap text-[13px] font-medium text-[#a81254] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a81254]/40 rounded'
                  onClick={() => navigate('/reset-password')}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {error && (
                <p role='alert' className='mt-4 text-center text-sm text-red-600'>
                  {typeof error === 'string' ? error : 'Une erreur est survenue'}
                </p>
              )}

              <Button type='submit' className={cn(primaryButton, 'mt-6 w-full')} disabled={loading}>
                <LogIn className='h-4 w-4' />
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          )}
        </div>

        {/* ── Panneau de marque : dégradé marine -> framboise, grand cercle blanc avec l'icône ── */}
        <div
          className='relative hidden md:flex items-center justify-center overflow-hidden'
          style={{ background: 'linear-gradient(165deg, #2b2b6e 0%, #1b1b3a 48%, #a81254 135%)' }}
        >
          <div aria-hidden='true' className='absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10' />
          <div aria-hidden='true' className='absolute -bottom-20 -left-12 h-72 w-72 rounded-full bg-white/10' />
          <div className='relative flex h-56 w-56 flex-col items-center justify-center gap-3 rounded-full bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)]'>
            {/* Le « A » du logo THAIS, en deux tons : moitié gauche foncée, droite plus claire ; creux gris à gauche, blanc à droite. */}
            <svg viewBox='-2 -2 96 69' className='h-16 w-auto' aria-hidden='true'>
              <polygon points='46,0 92,65 0,65' fill='#c8567a' />
              <polygon points='46,0 0,65 46,65' fill='#a81254' />
              <polygon points='46,23 69,54 23,54' fill='#ffffff' />
              <polygon points='46,23 23,54 46,54' fill='#bbbdbf' />
            </svg>
            <img src='/logo-thais-couleur.png' alt='THAIS' className='w-36 h-auto' />
          </div>
        </div>
      </div>

      </main>

      {/* ════ Pied de page : sans fond, texte sombre avec halo blanc pour rester lisible sur les immeubles ════ */}
      <footer className='login-footer relative z-10 mx-auto mb-6 flex flex-col items-center gap-2.5 px-4 text-center [text-shadow:0_0_6px_rgba(255,255,255,0.95),0_0_14px_rgba(255,255,255,0.9)]'>
        <div className='flex flex-col items-center gap-3 sm:flex-row sm:gap-4'>
          <a href={COMPANY_URL} target='_blank' rel='noreferrer' aria-label={COMPANY_NAME} className='shrink-0'>
            <img src='/svb-logo-thais.png' alt={COMPANY_NAME} className='h-12 w-auto drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]' />
          </a>
          <div className='text-center text-[15px] font-medium leading-snug text-slate-700 sm:text-left'>
            <p>Téléphone : 05 20 995 959</p>
            <p>
              infos@svbdev.com <span className='mx-1.5 font-bold text-[#a81254]'>|</span>
              <a href={COMPANY_URL} target='_blank' rel='noreferrer' className='font-semibold text-[#a81254] hover:underline'>
                www.svbdev.com
              </a>
            </p>
          </div>
        </div>
        <span aria-hidden='true' className='h-0.5 w-14 rounded-full bg-gradient-to-r from-[#a81254] to-[#1b1b3a]' />
        <p className='text-sm font-medium text-slate-600'>Copyright © 2026 {COMPANY_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}
