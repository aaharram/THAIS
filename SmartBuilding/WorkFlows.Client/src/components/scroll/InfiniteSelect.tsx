import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface InfiniteSelectProps<T> {
  label?: string;
  placeholder?: string;
  value: string | number | undefined;

  items: T[];
  labelSelector: (item: T) => string;
  valueSelector: (item: T) => string | number;

  onChange: (value: string | number) => void;

  hasMore: boolean; // allItems.length < totalCount
  loadMore: () => void; // fetch next page

  disabled?: boolean;
  loading?: boolean;
}

export function InfiniteSelect<T>({
  label,
  placeholder,
  value,
  items,
  labelSelector,
  valueSelector,
  onChange,
  hasMore,
  loadMore,
  disabled = false,
  loading = false,
}: InfiniteSelectProps<T>) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleScroll = () => {
      // bottom reached
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
        if (hasMore) loadMore();
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadMore]);

  return (
    <div className='space-y-2'>
      {label && <label className='text-sm font-medium'>{label}</label>}

      <Select value={String(value)} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className='bg-gray-50 text-black'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent ref={contentRef} className='max-h-64 overflow-auto'>
          {items.map((item) => {
            const val = valueSelector(item);
            const lbl = labelSelector(item);

            return (
              <SelectItem key={val} value={String(val)}>
                {lbl}
              </SelectItem>
            );
          })}

          {loading && (
            <div className='flex items-center justify-center py-2'>
              <Loader2 className='w-4 h-4 animate-spin' />
            </div>
          )}

          {hasMore && !loading && (
            <div className='text-center py-2 text-gray-500 text-xs'>Scroll to load more...</div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
