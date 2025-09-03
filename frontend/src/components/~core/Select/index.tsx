'use client';

import React from 'react';
import { Select as AntSelect, SelectProps, Button, Divider } from 'antd';
import './select.styles.css';
import { cn } from '~/lib/utils';
import { useWindowSize } from 'usehooks-ts';
import TextBox from '~/components/~core/TextBox';
import { Icon } from '~/icons/Icon';

const Select = ({
  className,
  rootClassName,
  placeholder,
  maxTagCount = 3,
  variant = 'outlined',
  onMouseEnter,
  onMouseLeave,
  onDropdownVisibleChange,
  ...props
}: SelectProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);

  return <AntSelect
    rootClassName={cn('select-override min-w-60', className, rootClassName)}
    placeholder={placeholder || "Please select"}
    suffixIcon={
      isHovered && variant === 'borderless' ? <Icon icon='lucide:chevrons-up-down' size={18} /> : variant !== 'borderless' ? <Icon icon='lucide:chevron-down' size={18} /> : null
    }
    maxTagPlaceholder={(omittedValues) => (
      <span className='p-1 px-2 bg-primary text-white rounded-md'>+{omittedValues.length}</span>
    )}
    maxTagCount={maxTagCount}
    onMouseEnter={(e) => {
      setIsHovered(true);
      onMouseEnter?.(e);
    }}
    onMouseLeave={(e) => {
      if (!isDropdownVisible) setIsHovered(false);
      onMouseLeave?.(e);
    }}
    onDropdownVisibleChange={(visible) => {
      onDropdownVisibleChange?.(visible);
      setIsHovered(visible);
      setIsDropdownVisible(visible);
    }}
    variant={isHovered && variant === 'borderless' ? 'outlined' : variant}
    {...props} />;
};

interface Props extends SelectProps {
  isCascader?: boolean;
}

const SelectCascader = (props: Props) => {
  const {
    isCascader = false,
    className,
    rootClassName,
    showSearch = true,
    onDropdownVisibleChange,
  } = props;

  const [searchValue, setSearchValue] = React.useState('');
  const isMobile = useWindowSize().width < 768;
  const [visible, setVisible] = React.useState(false);

  const dropdownRender = (menus: React.ReactNode) => (
    <>
      <div className="flex gap-3 items-center justify-between p-1 pb-3">
        <TextBox
          className="min-h-[44px] w-full px-3 py-1 text-sm placeholder:text-sm !rounded border border-solid border-[#D0D5DD] !shadow-none"
          prefix={
            <Icon icon='lucide:search' className='text-slate-500' size={22} />
          }
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)} />
        <Button
          className="!p-2 !h-10 !w-11 text-gray-900 !rounded"
          onClick={() => setVisible(false)}
        >
          <Icon icon='lucide:x' className='text-slate-500' size={20} />
        </Button>
      </div>
      <Divider dashed className="!mt-0 !mb-3 !border-[#DCDCDC]" />
      {menus}
    </>
  );

  return !isCascader ? <Select {...props} /> : <div>
    <Select
      rootClassName={cn('select-cascader-override', className, rootClassName)}
      open={visible}
      showSearch={showSearch}
      searchValue={searchValue}
      onSearch={showSearch ? (value) => setSearchValue(value) : undefined}
      dropdownRender={isMobile ? dropdownRender : undefined}
      onDropdownVisibleChange={(visible) => {
        if (isCascader) {
          setVisible(visible);
        }
        onDropdownVisibleChange?.(visible);
      }}
      popupClassName={cn(
        'select-dropdown-override',
        isMobile && 'select-dropdown-override-mobile z-[1205]'
      )}
      {...props} />
    {isMobile && visible && <div className="fixed left-0 top-0 z-[1200] h-screen w-screen bg-black/40" />}
  </div>;
}

export { SelectCascader as Select };