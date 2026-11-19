import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function ResetPasswordConfirmation() {
    const navigate = useNavigate();
  return (
    <div className='flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <Card className='overflow-hidden'>
          <CardContent className='p-6'>
            <div className='flex flex-col items-center gap-4'><br />
              <div className='relative'>
                <div className='absolute -inset-4 bg-blue-50 rounded-full' />
                <Mail className='relative h-6 w-6 text-[#1d2e5c]' />
              </div><br/>
              <h2 className='text-lg font-semibold'>Courriel envoyé</h2>
            </div>

            <div className='mt-6 space-y-4 text-center'>
              <p className='text-sm'>
                Un lien de réinitialisation a été envoyé à :<br />
                <span className='font-medium text-blue-600'>user@example.com</span>
              </p><br />
              
              <div className='pt-4 border border-[#3d63dd] bg-blue-50 rounded-lg p-4 text-left !mb-[12%]'> {/* Added text-left */}
  <h3 className='font-semibold text-black-800'>Instructions</h3>
  <p className='text-sm text-black-700 text-left'> {/* Added text-left */}
    Vérifiez votre boîte de réception et cliquez sur le lien de réinitialisation.<br />
    Si vous ne recevez pas le courriel dans les 5 minutes, vérifiez votre dossier spam.
  </p>
</div>
<Button variant='outline' className='w-full mt-4' onClick={() => navigate('/new-password')}>Test (Go to New Password Page)</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}