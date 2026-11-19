import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatFrenchDateTime = (date: Date): string => {
  const datePart = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  const timePart = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return `${datePart} - ${timePart}`;
};

export const toLocaleTime = (d: Date) => format(d, 'HH:mm', { locale: fr });
export const toLocaleDate = (d: Date) => format(d, 'dd/MM/yyyy', { locale: fr });

export const formatTimeSafe = (input?: string | Date | null) => {
  const d = toDate(input);
  return d ? toLocaleTime(d) : '--:--';
};

export const calculateDurationSafe = (
  start?: string | Date | number | null,
  end?: string | Date | number | null,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = toDate(start as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = toDate(end as any);
  if (!s || !e) return '--:--';
  const diffMs = Math.abs(e.getTime() - s.getTime());
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.min(Math.floor(totalMinutes / 60), 999);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export /** Convert either epoch (seconds or ms) or ISO string or custom date -> Date | null */
const toDate = (value?: string | number | Date | null): Date | null => {
  if (!value && value !== 0) return null;

  // If it's already a Date
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // If number, treat as timestamp (detect seconds vs ms)
  if (typeof value === 'number') {
    // if value looks like seconds (10 digits) convert to ms
    const asMs = value < 1e12 ? value * 1000 : value;
    const d = new Date(asMs);
    return isNaN(d.getTime()) ? null : d;
  }

  // If string:
  const s = value as string;

  // Try ISO parse first
  const iso = new Date(s);
  if (!isNaN(iso.getTime())) return iso;

  // If time-only like "HH:mm" or "HH:mm:ss"
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    const [h, m, sec = '0'] = s.split(':');
    const d = new Date();
    d.setHours(Number(h), Number(m), Number(sec), 0);
    return d;
  }

  // Custom date parser (dd/MM/yyyy or something handled by parseCustomDate())
  if (s.includes('/')) {
    const parsed = parseCustomDate(s);
    return parsed ?? null;
  }

  // fallback
  return null;
};

export const parseCustomDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
  if (match) {
    const [day, month, year, hours, minutes, seconds] = match;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds),
    );
  }

  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

export const getStartOfWeek = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

export const getEndOfWeek = (date: Date) => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

export const formatDate = (date: Date): string => {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatPercent = (percent: number): string => {
  return `${percent}%`;
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('fr-FR').format(number);
};

// Copie THAIS : une superficie s'affiche toujours avec deux décimales (ex. 4588 -> « 4588.00 »,
// 161.4 -> « 161.40 »). Une valeur absente reste « - ».
export const formatSurface = (value?: number | null): string =>
  value == null ? '-' : Number(value).toFixed(2);

export const formatTime = (date: Date): string => {
  return `${date.getHours()}h${date.getMinutes()}`;
};

export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} à ${formatTime(date)}`;
};

export const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours}h${minutes}`;
};

export const formatDurationMinutes = (duration: number): string => {
  return `${duration}min`;
};

export const formatDurationSeconds = (duration: number): string => {
  return `${duration}s`;
};

export const formatWithLeadingZeros = (number: number, length: number): string => {
  return number.toString().padStart(length, '0');
};

export const formatToPrecision = (number: number, precision: number): string => {
  return number.toFixed(precision);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleanedNumber = phoneNumber.replace(/\D/g, '');

  if (cleanedNumber.length === 10) {
    return `+33 ${cleanedNumber.substring(0, 1)} ${cleanedNumber.substring(
      1,
      3,
    )} ${cleanedNumber.substring(3, 5)} ${cleanedNumber.substring(5, 7)} ${cleanedNumber.substring(
      7,
      9,
    )}`;
  }

  return phoneNumber;
};

export const formatISODate = (date: Date): string => {
  return date.toISOString();
};

export const formatLongDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatFileSize = (sizeInBytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  while (sizeInBytes >= 1024 && index < units.length - 1) {
    sizeInBytes /= 1024;
    index++;
  }
  return `${sizeInBytes.toFixed(2)} ${units[index]}`;
};

export const formatBoolean = (value: boolean): string => {
  return value ? 'Oui' : 'Non';
};

export const formatList = (items: string[]): string => {
  return items.join(', ');
};

export const formatElapsedTime = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  const intervals = [
    { label: 'année', seconds: 31536000 },
    { label: 'mois', seconds: 2592000 },
    { label: 'jour', seconds: 86400 },
    { label: 'heure', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return "tout à l' heure";
};
