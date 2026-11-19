import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Title } from '@/components/ui/title';
import { setIsLdap } from '@/store/features/settings/SettingSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CheckCircle2, LogIn, ShieldCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

function LdapConfig() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentIsLdap = useAppSelector((state) => state.settings.isLdap);

  const [value, setValue] = useState(currentIsLdap);
  const [saved, setSaved] = useState(false);

  const hasChanged = value !== currentIsLdap;

  const handleSave = () => {
    dispatch(setIsLdap(value));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className='space-y-4 max-w-xl'>
      <Title
        title='Configuration LDAP'
        description="Paramétrez le mode d'authentification de l'application"
      />

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base flex items-center gap-2'>
            <ShieldCheck className='w-4 h-4 text-primary' />
            Mode d'authentification
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className='pt-6 space-y-6'>

          {/* Toggle */}
          <div className='flex items-center justify-between p-4 rounded-xl border bg-muted/30'>
            <div className='space-y-1'>
              <p className='font-medium text-sm'>Activer l'authentification LDAP</p>
              <p className='text-xs text-muted-foreground'>
                Active la connexion via l'annuaire LDAP de l'entreprise
              </p>
            </div>
            <Switch
              checked={value}
              onCheckedChange={(v) => {
                setValue(v);
                setSaved(false);
              }}
            />
          </div>

          {/* Info box */}
          <div
            className={`rounded-xl border p-4 space-y-2 transition-colors ${
              value ? 'border-primary/30 bg-primary/5' : 'border-muted bg-muted/20'
            }`}
          >
            <div className='flex items-center gap-2'>
              <LogIn className={`w-4 h-4 ${value ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className='text-sm font-medium'>
                {value ? 'LDAP activé' : 'LDAP désactivé'}
              </p>
            </div>
            <p className='text-xs text-muted-foreground'>
              {value ? (
                <>
                  Les utilisateurs se connectent via{' '}
                  <code className='px-1 py-0.5 rounded bg-muted font-mono text-xs'>/login</code>{' '}
                  (authentification LDAP).
                </>
              ) : (
                <>
                  Les utilisateurs se connectent via{' '}
                  <code className='px-1 py-0.5 rounded bg-muted font-mono text-xs'>/adminlogin</code>{' '}
                  (authentification locale).
                </>
              )}
            </p>
          </div>

          {/* Current state */}
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            {currentIsLdap ? (
              <CheckCircle2 className='w-3.5 h-3.5 text-green-500' />
            ) : (
              <XCircle className='w-3.5 h-3.5 text-muted-foreground' />
            )}
            <span>
              Paramètre actuel :{' '}
              <span className='font-medium text-foreground'>
                LDAP {currentIsLdap ? 'activé' : 'désactivé'}
              </span>
            </span>
          </div>

          {saved && (
            <p className='text-xs text-green-600 font-medium flex items-center gap-1'>
              <CheckCircle2 className='w-3.5 h-3.5' />
              Paramètre enregistré.
            </p>
          )}
        </CardContent>
      </Card>

      <div className='flex justify-end gap-2'>
        <Button variant='secondary' onClick={() => navigate('/configuration-globale')}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={!hasChanged}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

export default LdapConfig;
