import { AppLogo } from '@/components/brand/AppLogo';
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

  return (
    <div className={cn('relative min-h-screen w-full flex items-center justify-center overflow-hidden p-4 sm:p-6 md:p-10 font-sans')} {...props}>
      <style>{`
        /* ── Animated background ── */
        @keyframes bg-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .login-bg {
          background: linear-gradient(135deg, #ffffff 0%, #f7fbff 28%, #edf6ff 60%, #e6f1fb 100%);
          background-size: 300% 300%;
          animation: bg-shift 14s ease infinite;
        }

        /* ── Blob drifts ── */
        @keyframes drift-one {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(40px,-60px) scale(1.06); }
          66%      { transform: translate(-30px,30px) scale(0.96); }
        }
        @keyframes drift-two {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(-50px,40px) scale(0.93); }
          66%      { transform: translate(40px,-40px) scale(1.10); }
        }
        @keyframes drift-three {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,30px) scale(1.04); }
          66%      { transform: translate(-40px,-50px) scale(0.95); }
        }
        @keyframes drift-four {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,-30px) scale(1.08); }
        }
        .blob-1 { animation: drift-one   14s ease-in-out infinite; }
        .blob-2 { animation: drift-two   17s ease-in-out infinite; }
        .blob-3 { animation: drift-three 20s ease-in-out infinite; }
        .blob-4 { animation: drift-four  11s ease-in-out infinite; }

        /* ── Card entrance ── */
        @keyframes fade-slide-up {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .login-card-enter { animation: fade-slide-up 0.65s cubic-bezier(0.16,1,0.3,1) forwards; }

        /* ── Floating glassmorphic card ── */
        .glass-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.10), inset 0 1px 0 rgba(255,255,255,0.85);
        }

        /* ── Glass inputs ── */
        .glass-input {
          background: rgba(255,255,255,0.92) !important;
          border: 1px solid rgba(191, 219, 254, 0.75) !important;
          color: #0f172a !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
        }
        .glass-input::placeholder { color: rgba(100, 116, 139, 0.75) !important; }
        .glass-input:focus,
        .glass-input:focus-visible {
          outline: none !important;
          border-color: rgba(79,143,240,0.85) !important;
          box-shadow: 0 0 0 3px rgba(79,143,240,0.20) !important;
          background: rgba(255,255,255,1) !important;
        }

        /* ── Organic panel shape for the right illustration ── */
        .wave-panel {
          clip-path: polygon(
            0 0, 100% 0%, 100% 100%, 24% 100%,
            14% 92%, 7% 79%, 3% 63%, 7% 48%, 3% 32%, 11% 18%, 22% 8%
          );
          border-radius: 0 2.2rem 2.2rem 0;
          background: linear-gradient(135deg, #ffffff 0%, #f7fbff 28%, #edf6ff 60%, #e6f1fb 100%);
        }
        .panel-shell {
          border-radius: 0 2.2rem 2.2rem 0;
          background: linear-gradient(135deg, #ffffff 0%, #f7fbff 28%, #edf6ff 60%, #e6f1fb 100%);
          box-shadow: none;
        }
      `}</style>

      {/* ── Animated gradient background ── */}
      <div className='login-bg absolute inset-0' />

      {/* ── Global decorative blobs ── */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div
          className='absolute -top-[15%] -left-[10%] w-[42vw] h-[42vw] max-w-[500px] max-h-[500px] rounded-full opacity-12 blob-1'
          style={{ backgroundColor: '#BFDDF8', filter: 'blur(100px)' }}
        />
        <div
          className='absolute top-[30%] -right-[15%] w-[36vw] h-[36vw] max-w-[430px] max-h-[430px] rounded-full opacity-10 blob-2'
          style={{ backgroundColor: '#8CBEEB', filter: 'blur(110px)' }}
        />
        <div
          className='absolute -bottom-[20%] left-[20%] w-[40vw] h-[40vw] max-w-[480px] max-h-[480px] rounded-full opacity-8 blob-3'
          style={{ backgroundColor: '#DCEBFA', filter: 'blur(120px)' }}
        />
        <div
          className='absolute top-[5%] right-[30%] w-[20vw] h-[20vw] max-w-[260px] max-h-[260px] rounded-full opacity-10 blob-4'
          style={{ backgroundColor: '#9FC7F2', filter: 'blur(80px)' }}
        />
      </div>

      {/* ── Card wrapper ── */}
      <div className='w-full max-w-4xl z-10'>
        <div className={cn('flex flex-col gap-6', className)}>

          <div className='glass-card overflow-hidden rounded-[2rem] login-card-enter shadow-[0_30px_90px_rgba(2,6,23,0.4)]'>
            <div className='grid p-0 md:grid-cols-2 min-h-[560px]'>

              {/* ════ LEFT COLUMN : Form ════ */}
              <div className='flex flex-col justify-center p-8 sm:p-10'>

                {/* Mobile header (logo only on small screens) */}
                <div className='md:hidden flex flex-col items-center mb-8'>
                  <AppLogo className='w-20 h-20 mb-3 drop-shadow-lg' />
                  <h1 className='text-2xl font-bold text-slate-800 tracking-tight'>THAIS</h1>
                </div>

                {requiresPasswordReset ? (
                  /* ── First-login / reset-password form ── */
                  <form onSubmit={resetForm.handleSubmit(onSubmitReset)} className='space-y-6'>
                    <div>
                      <h2 className='text-2xl font-bold text-slate-800 tracking-tight'>
                        Première connexion
                      </h2>
                      <p className='text-sm text-slate-500 mt-1.5'>
                        Veuillez définir votre nouveau mot de passe
                      </p>
                    </div>

                    <input type='hidden' {...resetForm.register('username')} />

                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='newPassword' className='text-sm font-medium text-slate-700'>
                          Nouveau mot de passe
                        </Label>
                        <Input
                          id='newPassword'
                          type='password'
                          placeholder='Entrez votre nouveau mot de passe'
                          disabled={loading}
                          className='glass-input w-full h-11 px-3 rounded-lg'
                          {...resetForm.register('newPassword')}
                        />
                        {resetForm.formState.errors.newPassword && (
                          <p className='text-xs text-red-500 mt-1'>
                            {resetForm.formState.errors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='confirmPassword' className='text-sm font-medium text-slate-700'>
                          Confirmer le mot de passe
                        </Label>
                        <Input
                          id='confirmPassword'
                          type='password'
                          placeholder='Confirmez votre nouveau mot de passe'
                          disabled={loading}
                          className='glass-input w-full h-11 px-3 rounded-lg'
                          {...resetForm.register('confirmPassword')}
                        />
                        {resetForm.formState.errors.confirmPassword && (
                          <p className='text-xs text-red-500 mt-1'>
                            {resetForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='space-y-3 pt-2'>
                      {error && (
                        <p className='text-sm text-red-500 text-center'>
                          {typeof error === 'string' ? error : 'Une erreur est survenue'}
                        </p>
                      )}
                      <div className='flex gap-3'>
                        <Button
                          variant='outline'
                          type='button'
                          className='w-1/3 h-11 border-slate-200 text-slate-700 bg-white/80 hover:bg-slate-50 rounded-lg transition-colors'
                          disabled={loading}
                          onClick={handleBackToLogin}
                        >
                          Retour
                        </Button>
                        <Button
                          type='submit'
                          className='w-2/3 h-11 bg-gradient-to-r from-[#05051A] to-[#2E2BB0] text-white font-medium rounded-lg shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 transition-all duration-200 border border-white/10'
                          disabled={loading}
                        >
                          {loading ? 'Traitement...' : 'Enregistrer'}
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* ── Login form ── */
                  <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className='space-y-6'>
                    <div className='hidden md:block'>
                      <div className='flex items-start gap-3'>
                        <div className='w-[3px] h-[calc(1.5rem+2.5rem)] rounded-full bg-gradient-to-b from-[#05051A] to-[#2E2BB0]' />
                        <div className='flex items-center gap-3'>
                          <AppLogo className='w-8 h-8 shadow-sm' />
                          <div>
                            <h2 className='text-2xl font-bold text-slate-800 tracking-tight'>
                              Se connecter
                            </h2>
                            <p className='text-sm text-slate-500 mt-1.5'>
                              Connectez-vous à votre compte THAIS
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='username' className='text-sm font-medium text-slate-700'>
                          Code Utilisateur
                        </Label>
                        <Input
                          id='username'
                          type='text'
                          placeholder='Entrez votre code utilisateur'
                          disabled={loading}
                          className='glass-input w-full h-11 px-3 rounded-lg'
                          {...loginForm.register('username')}
                        />
                        {loginForm.formState.errors.username && (
                          <p className='text-xs text-red-500 mt-1'>
                            {loginForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='password' className='text-sm font-medium text-slate-700'>
                          Mot de passe
                        </Label>
                        <Input
                          id='password'
                          type='password'
                          placeholder='Entrez votre mot de passe'
                          disabled={loading}
                          className='glass-input w-full h-11 px-3 rounded-lg'
                          {...loginForm.register('password')}
                        />
                        {loginForm.formState.errors.password && (
                          <p className='text-xs text-red-500 mt-1'>
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className='flex items-center justify-between pt-1'>
                        <div className='flex items-center space-x-2'>
                          <Checkbox
                            id='rememberMe'
                            checked={loginForm.watch('rememberMe')}
                            onCheckedChange={(checked: boolean) =>
                              loginForm.setValue('rememberMe', checked)
                            }
                            className='border-slate-300 data-[state=checked]:bg-[#2E2BB0] data-[state=checked]:border-[#2E2BB0]'
                          />
                          <Label
                            htmlFor='rememberMe'
                            className='text-sm font-normal text-slate-600 select-none cursor-pointer'
                          >
                            Se souvenir de moi
                          </Label>
                        </div>
                        <span
                          className='text-sm text-[#4F8FF0] hover:text-[#2E2BB0] cursor-pointer transition-colors duration-200 font-medium'
                          onClick={() => navigate('/reset-password')}
                        >
                          Mot de passe oublié ?
                        </span>
                      </div>
                    </div>

                    <div className='space-y-3 pt-2'>
                      {error && (
                        <p className='text-sm text-red-500 text-center'>
                          {typeof error === 'string' ? error : 'Une erreur est survenue'}
                        </p>
                      )}
                      <Button
                        type='submit'
                        className='w-full h-11 bg-gradient-to-r from-[#05051A] to-[#2E2BB0] text-white font-medium rounded-lg shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 transition-all duration-200 border border-white/10'
                        disabled={loading}
                      >
                        {loading ? 'Connexion...' : 'Se connecter'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* ════ RIGHT COLUMN : Wavy gradient panel ════ */}
              <div className='hidden md:block relative overflow-hidden panel-shell'>
                {/* Wavy light panel */}
                <div className='wave-panel absolute inset-0' />

                {/* Decorative blobs inside the panel */}
                <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                  <div
                    className='absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full opacity-20'
                    style={{ backgroundColor: '#9FC7F2', filter: 'blur(70px)' }}
                  />
                  <div
                    className='absolute bottom-[-10%] left-[5%] w-56 h-56 rounded-full opacity-16'
                    style={{ backgroundColor: '#4F8FF0', filter: 'blur(80px)' }}
                  />
                  <div
                    className='absolute top-[38%] left-[-8%] w-36 h-36 rounded-full opacity-14'
                    style={{ backgroundColor: '#2E2BB0', filter: 'blur(60px)' }}
                  />
                  {/* Shimmer rings */}
                  <div className='absolute top-[14%] right-[18%] w-28 h-28 rounded-full border border-[#4F8FF0]/20' />
                  <div className='absolute bottom-[22%] right-[22%] w-16 h-16 rounded-full border border-[#2E2BB0]/20' />
                  <div className='absolute top-[60%] right-[10%] w-10 h-10 rounded-full border border-[#4F8FF0]/15' />
                </div>

                {/* Logo + brand */}
                <div className='relative z-10 flex flex-col items-center justify-center h-full px-10'>
                  <div className='rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.18)] mb-5 hover:scale-105 transition-transform duration-300 cursor-default'>
                    <AppLogo variant='wordmark' className='w-64' />
                  </div>
                  <h1 className='text-slate-800 text-2xl font-bold tracking-wide text-center drop-shadow-sm'>
                    THAIS
                  </h1>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
