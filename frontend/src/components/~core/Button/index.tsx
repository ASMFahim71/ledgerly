import React from 'react'
import { Button as AntButton, type ButtonProps } from 'antd';
import { cn } from '~/lib/utils';

interface Props extends ButtonProps {
  asIcon?: boolean;
}

const Button = ({ asIcon, style, className, ...props }: Props) => {
  return <AntButton
    classNames={{
      icon: 'translate-y-0.5'
    }}
    style={{
      fontFamily: 'inherit',
      // Vertical padding. Doesn't work if defined in theme.
      padding: 24,
      borderRadius: 8,
      ...style
    }}
    className={cn(
      'w-full',
      className,
      { '!w-auto !p-0 !h-12 aspect-square !border-2 !rounded-md': asIcon }
    )}
    {...props} />
}

export default Button;