import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Vignette de l'actif dans la liste (RMANew ListBuilding : colonne « Image », un clic ouvre l'image en grand).
 * Le fichier est servi par l'API avec authentification, d'où le chargement en blob.
 */
export function BuildingThumb({ fileName }: { fileName?: string | null }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!fileName) return;
    let objectUrl: string | null = null;
    let annule = false;
    api
      .get(`${API_BASE_URL}/api/attachments/actifs/${fileName}`, { responseType: 'blob' })
      .then(({ data }) => {
        if (annule) return;
        objectUrl = URL.createObjectURL(data as Blob);
        setUrl(objectUrl);
      })
      .catch(() => setUrl(null));
    return () => {
      annule = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileName]);

  if (!url) {
    return (
      <div className='flex items-center justify-center h-9 w-9 rounded-md bg-gray-100 text-muted-foreground'>
        <ImageOff className='h-4 w-4' />
      </div>
    );
  }

  return (
    <button
      type='button'
      title="Voir l'image"
      onClick={(e) => {
        e.stopPropagation();
        window.open(url, '_blank');
      }}
      className='block h-9 w-9 overflow-hidden rounded-md ring-1 ring-black/10'
    >
      <img src={url} alt='' className='h-full w-full object-cover' />
    </button>
  );
}
