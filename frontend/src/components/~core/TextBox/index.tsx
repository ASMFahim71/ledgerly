import React from 'react'
import './textbox.styles.css'
import { Input, type InputProps as AntdInputProps, type InputRef } from 'antd';
import { cn } from '~/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';

/* 
  1. The GENERIC one.
  Commonly known as Controlled Input.

  const [value, setValue] = useState("");

  <Input value={value} onChange={(e) => setValue(e.target.value)} />


  2. The DEBOUNCED variant.
  NOTE: Avoid passing the value prop. This will mess up the debouncing.

  const [value, setValue] = useState("");
  console.log(value);

  <Input debounced onChange={(e) => setValue(e.target.value)} />


  3. The URL synced variant.
  NOTE: No need to pass any value or onChange prop. Pass a string as syncUrl prop. That string will be also be the query params key of the URL.

  <Input syncUrl='query' /> */

interface InputProps extends AntdInputProps {
  inputType?: 'default' | 'urlsynced' | 'debounced';
  delay?: number;
  syncKey?: string;
}

type Props<T> = T extends { inputType: 'urlsynced' }
  ? Omit<T, 'value' | 'onChange'> & {
    syncKey: string;
    onChange?: never;
  }
  : T extends { inputType: 'debounced' }
  ? Omit<T, 'value'> & {
    syncKey?: never;
  }
  : T & { syncKey?: never; delay?: never; };

const TextBox = React.forwardRef<InputRef, Props<InputProps>>(({
  inputType = 'default',
  className,
  placeholder,
  delay = 500,
  syncKey = "",
  onChange,
  ...props
}, ref) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleUrlSync = debounce((searchTerm: string) => {
    const currentParams = new URLSearchParams(searchParams);

    if (searchTerm) {
      currentParams.set(syncKey, searchTerm);
    } else {
      currentParams.delete(syncKey);
    }

    router.replace(`${pathname}?${currentParams.toString()}`);
  }, delay);

  const handleDebounce = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
  }, delay);

  return <Input
    ref={ref}
    onChange={
      inputType === 'urlsynced'
        ? (e) => handleUrlSync(e.target.value) : inputType === 'debounced' ? handleDebounce
          : onChange
    }
    defaultValue={
      inputType === 'urlsynced' ? searchParams.get(syncKey)?.toString() : undefined
    }
    className={cn('input-override w-full min-h-12', className)}
    placeholder={placeholder || 'Search by city, address, or zipCode'}
    {...props} />
});

TextBox.displayName = 'TextBox';

export default TextBox;