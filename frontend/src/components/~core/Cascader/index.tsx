'use client';

import React from 'react';
import { Button, Cascader as AntCascader, type CascaderProps, Divider, Input } from "antd";
import './cascader.styles.css';
import { useWindowSize } from 'usehooks-ts';
import classNames from 'classnames';
import { Icon } from '~/icons/Icon';

const Cascader = ({ showSearch = true, ...props }: CascaderProps) => {
  const isMobile = useWindowSize().width < 778;
  const [visible, setVisible] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const dropdownRender = React.useCallback(
    (menus: React.ReactNode) => (
      <MobileDropdown menus={menus} title='City/Town' showSearch={showSearch} searchValue={searchValue} setSearchValue={setSearchValue} setVisible={setVisible} />
    ),
    [searchValue, showSearch],
  );

  return (
    <div className="flex flex-col">
      {/* @ts-expect-error ignore */}
      <AntCascader
        open={visible}
        rootClassName={classNames(['cascader-override', 'min-w-60'])}
        allowClear={false}
        defaultValue={['toronto', 'toronto & East York']}
        showSearch={showSearch}
        placeholder="Please select"
        searchValue={searchValue}
        onSearch={showSearch ? (value) => setSearchValue(value) : undefined}
        suffixIcon={
          <Icon icon='lucide:chevron-down' size={18} />
        }
        expandIcon={
          <Icon icon='lucide:chevron-right' className='active' size={18} />
        }
        placement={isMobile ? "topLeft" : undefined}
        dropdownRender={isMobile ? dropdownRender : undefined}
        onDropdownVisibleChange={setVisible}
        popupClassName={classNames([
          'cascade-dropdown-override',
          isMobile && ['cascade-dropdown-override-mobile z-[1205]'],
        ])}
        displayRender={(label) => {
          return (
            <div className="flex items-center">
              {label.map((part, index) => (
                <span className="flex items-center" key={index}>
                  {part}
                  {index < label.length - 1 && (
                    <Icon icon='lucide:chevron-right' size={18} />
                  )}
                </span>
              ))}
            </div>
          );
        }}
        {...props} />
      {isMobile && visible && <div className="fixed left-0 top-0 z-[1200] h-screen w-screen bg-black/40" />}
    </div>
  );
};

const MobileDropdown = ({
  menus,
  title,
  showSearch,
  searchValue,
  setSearchValue,
  setVisible
}: {
  menus: React.ReactNode,
  title: string;
  setVisible: (visible: boolean) => void
  showSearch: CascaderProps['showSearch'];
  searchValue: string;
  setSearchValue: (value: string) => void;
}) => (
  <>
    <div
      className={classNames([
        "flex gap-2 items-center justify-between px-4 py-3",
      ])}
    >
      <div className="flex flex-1 flex-col gap-x-2">
        {!showSearch ? (
          <h3 className="text-md font-semibold text-gray-900">Choose {title}</h3>
        ) : (
          <Input
            className={"border-gray-350 min-h-[44px] w-full px-3 py-1 text-sm placeholder:text-sm rounded-lg border border-solid border-[#D0D5DD] !shadow-none"
            }
            prefix={<Icon icon='lucide:search' color="#c3c3c3" size={18} />}
            placeholder={`Search ${title}`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)} />
        )}
      </div>
      <Button
        className="!p-2 !h-10 !w-11 text-gray-900 !rounded"
        onClick={() => setVisible(false)}
      >
        <Icon icon='lucide:x' className='text-slate-500' size={20} />
      </Button>
    </div>
    <Divider className="!mt-0 !mb-2 !border-[#DCDCDC]" />
    {menus}
  </>
)

export default Cascader;