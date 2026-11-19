import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useUnsavedChanges = (hasUnsavedChanges: boolean) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return "Certaines modifications n'ont pas été enregistrées. Voulez-vous vraiment quitter?";
    };

    const unblock = (
      e: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>,
    ) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault();
      const target = e.currentTarget;

      const shouldLeave = window.confirm(
        'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page?',
      );

      if (shouldLeave) {
        if (target.tagName === 'A') {
          navigate((target as HTMLAnchorElement).href);
        } else if (target.tagName === 'BUTTON' && target.getAttribute('onClick')) {
          const onClick = target.getAttribute('onClick') || '';
          if (onClick.includes('navigate')) {
            const path = onClick.match(/navigate\(["']([^"']+)["']\)/)?.[1];
            if (path) {
              navigate(path);
            }
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const links = document.querySelectorAll('a[href]');
    const buttons = document.querySelectorAll('button');

    links.forEach((link) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      link.addEventListener('click', unblock as any);
    });

    buttons.forEach((button) => {
      if (button.getAttribute('onClick')?.includes('navigate')) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        button.addEventListener('click', unblock as any);
      }
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      links.forEach((link) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        link.removeEventListener('click', unblock as any);
      });
      buttons.forEach((button) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        button.removeEventListener('click', unblock as any);
      });
    };
  }, [hasUnsavedChanges, navigate]);
};
