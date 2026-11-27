import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/lib/utils';
import { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Kit de mise en page des formulaires : sections en cartes, grille de 12 colonnes pour que les champs liés se placent
 * côte à côte (prénom + nom, code postal + ville...), séparateurs de groupes et champs prêts à l'emploi.
 *
 *   <FormColumns>                       deux colonnes de sections sur grand écran
 *     <FormStack>                       une colonne de sections
 *       <FormSection icon title>        carte avec en-tête
 *         <FormGrid>                    grille de 12 colonnes
 *           <FormGroupTitle>Identité</FormGroupTitle>
 *           <TextField span={6} ... />  prénom
 *           <TextField span={6} ... />  nom
 */

// ---------------------------------------------------------------------------------------------------------------------
// Structure
// ---------------------------------------------------------------------------------------------------------------------

export const FormColumns = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('grid grid-cols-1 items-start gap-6 xl:grid-cols-2', className)}>{children}</div>
);

export const FormStack = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('min-w-0 space-y-6', className)}>{children}</div>
);

export const FormSection = ({
  icon: Icon,
  title,
  description,
  aside,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** élément affiché à droite de l'en-tête (pastille, bouton...) */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', className)}>
    <header className='flex items-center justify-between gap-3 border-b bg-muted/30 px-5 py-3.5'>
      <div className='flex min-w-0 items-center gap-3'>
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
          <Icon className='h-[18px] w-[18px]' />
        </div>
        <div className='min-w-0'>
          <h3 className='text-sm font-semibold leading-tight'>{title}</h3>
          {description && <p className='truncate text-xs text-muted-foreground'>{description}</p>}
        </div>
      </div>
      {aside}
    </header>
    <div className='p-5'>{children}</div>
  </section>
);

export const FormGrid = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('grid grid-cols-12 gap-x-4 gap-y-4', className)}>{children}</div>
);

/**
 * Section + grille de 12 colonnes en un seul composant : remplace l'aide locale « Section » des anciens formulaires.
 * Les champs (Input, Select, Textarea) y prennent toute la largeur de leur colonne - sans cela le composant Input
 * partagé les limite à 90 % et ils ne s'alignent pas sur le bord de la carte.
 */
export const GridSection = ({
  icon,
  title,
  description,
  aside,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
}) => (
  <FormSection icon={icon} title={title} description={description} aside={aside}>
    <FormGrid className='[&_[role=combobox]]:w-full [&_input]:w-full [&_textarea]:w-full'>{children}</FormGrid>
  </FormSection>
);

/** Intitulé de sous-groupe dans une section (« Identification légale », « Adresse »...), sur toute la largeur. */
export const FormGroupTitle = ({ children }: { children: ReactNode }) => (
  <div className='col-span-12 flex items-center gap-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:pt-0'>
    <span>{children}</span>
    <span className='h-px flex-1 bg-border' />
  </div>
);

// ---------------------------------------------------------------------------------------------------------------------
// Champs
// ---------------------------------------------------------------------------------------------------------------------

// Largeur d'un champ en douzièmes. Classes écrites en entier pour que Tailwind les détecte.
const SPAN: Record<number, string> = {
  12: 'col-span-12',
  9: 'col-span-12 md:col-span-9',
  8: 'col-span-12 md:col-span-8',
  6: 'col-span-12 md:col-span-6',
  4: 'col-span-12 sm:col-span-6 md:col-span-4',
  3: 'col-span-12 sm:col-span-6 md:col-span-4',
  2: 'col-span-6 md:col-span-2',
};

export type FieldSpan = 2 | 3 | 4 | 6 | 8 | 9 | 12;

export const Field = ({
  label,
  htmlFor,
  required,
  error,
  hint,
  span = 6,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  span?: FieldSpan;
  className?: string;
  children: ReactNode;
}) => (
  <div className={cn('min-w-0 space-y-1.5', SPAN[span], className)}>
    <Label htmlFor={htmlFor} className='text-[13px] font-medium'>
      {label}
      {required && <span className='ml-0.5 text-red-500'>*</span>}
    </Label>
    {children}
    {hint && !error && <p className='text-xs text-muted-foreground'>{hint}</p>}
    {error && <p className='text-xs text-red-600 dark:text-red-400'>{error}</p>}
  </div>
);

type CommonFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  span?: FieldSpan;
  disabled?: boolean;
};

export const TextField = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  inputMode,
  step,
  ...field
}: CommonFieldProps & {
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email';
  step?: string;
}) => (
  <Field label={label} htmlFor={id} required={field.required} error={field.error} hint={field.hint} span={field.span}>
    <Input
      id={id}
      type={type}
      step={step}
      inputMode={inputMode}
      placeholder={placeholder}
      value={value ?? ''}
      disabled={field.disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn('w-full', field.error && 'border-red-400 focus-visible:ring-red-400')}
    />
  </Field>
);

export const TextAreaField = ({
  id,
  label,
  value,
  onChange,
  rows = 3,
  ...field
}: CommonFieldProps & {
  value: string | null | undefined;
  onChange: (value: string) => void;
  rows?: number;
}) => (
  <Field label={label} htmlFor={id} required={field.required} error={field.error} hint={field.hint} span={field.span ?? 12}>
    <Textarea id={id} rows={rows} value={value ?? ''} disabled={field.disabled} onChange={(e) => onChange(e.target.value)} />
  </Field>
);

export const SelectField = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Sélectionnez...',
  ...field
}: CommonFieldProps & {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) => (
  <Field label={label} htmlFor={id} required={field.required} error={field.error} hint={field.hint} span={field.span}>
    <Select value={value} onValueChange={onChange} disabled={field.disabled}>
      <SelectTrigger id={id} className={cn('w-full', field.error && 'border-red-400')}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </Field>
);

// ---------------------------------------------------------------------------------------------------------------------
// Divers
// ---------------------------------------------------------------------------------------------------------------------

/** Bandeau de synthèse des erreurs de validation, en haut du formulaire. */
export const FormErrorBanner = ({ errors }: { errors: Record<string, string> }) => {
  const messages = Object.values(errors);
  if (messages.length === 0) return null;
  return (
    <div role='alert' className='rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400'>
      <p className='font-medium'>Veuillez corriger les champs suivants :</p>
      <ul className='mt-1 list-disc pl-5'>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
};
