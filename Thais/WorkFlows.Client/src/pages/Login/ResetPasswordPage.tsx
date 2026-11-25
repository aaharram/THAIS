import { AppLogo } from '@/components/brand/AppLogo';
import { APP_TAGLINE } from '@/components/brand/company';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ResetPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className='flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <Card className='overflow-hidden'>
          <CardContent className='p-6 mb-[7%]'>
            <div className='flex flex-col items-center gap-4'>
              <AppLogo className='h-14 w-14' />
              <h1 className='text-xl font-bold -mt-[8%] text-[130%]'>THAIS</h1>
              <p className='text-sm text-muted-foreground -mt-[5%]'>{APP_TAGLINE}</p>
              <h2 className='text-lg font-semibold -mt-2 mr-[11%]'>
                Réinitialisation du mot de passe
              </h2>
            </div>

            <div className='mt-6 space-y-4'>
              <div>
                <Label htmlFor='email'>Courriel</Label>
                <div className='relative mt-1'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c2c3cd]' />
                  <Input
                    id='email'
                    placeholder='Entrez votre courriel'
                    className='pl-8 placeholder:text-[#c2c3cd] border-[#c2c3cd]'
                  />
                </div>
              </div>
              <Button
                type='button'
                className='w-full'
                onClick={() => navigate('/reset-password-confirmation')}
              >
                Valider
              </Button>

              <Button
                variant='outline'
                type='button'
                className='w-full bg-[#cdced7] hover:bg-[#cdced7]/90 text-gray-800'
                onClick={() => navigate(-1)}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
