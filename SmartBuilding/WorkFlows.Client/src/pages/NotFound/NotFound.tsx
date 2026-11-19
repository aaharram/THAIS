import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-4'>
      <FileQuestion className='w-16 h-16 text-muted-foreground opacity-40' />
      <div className='space-y-1'>
        <h1 className='text-4xl font-bold'>404</h1>
        <p className='text-lg font-medium'>Page introuvable</p>
        <p className='text-sm text-muted-foreground'>
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
      </div>
      <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
    </div>
  );
}

export default NotFound;
