import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  error?: string;
}

const ErrorMessage = ({ error }: ErrorMessageProps) => {
  if (!error) return null;

  return (
    <div className='flex items-center text-destructive text-sm mt-1'>
      <AlertCircle className='h-4 w-4 mr-1' />
      <span> {error}</span>
    </div>
  );
};

export default ErrorMessage;
