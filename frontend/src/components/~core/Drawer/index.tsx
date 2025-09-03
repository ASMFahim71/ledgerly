import React from 'react'
import { Drawer as AntDrawer, Space, type DrawerProps } from 'antd';
import { useWindowSize } from 'usehooks-ts';
import { Icon } from '~/icons/Icon';

const Drawer = ({
  closable = true,
  open = false,
  onClose,
  children,
  ...props
}: DrawerProps) => {
  const isMobile = useWindowSize().width < 800;

  return <AntDrawer
    placement={"right"}
    closable={isMobile ? true : closable}
    open={open}
    onClose={onClose}
    classNames={{
      body: 'p-0',
      mask: 'bg-indigo-500 bg-opacity-50',
      wrapper: 'font-outfit w-full',
    }}
    {...props}
  >
    {!isMobile && !closable && <DrawerSideControl onClose={onClose} />}
    {children}
  </AntDrawer>;
}

const DrawerSideControl = ({
  onClose
}: {
  onClose: ((e: React.MouseEvent | React.KeyboardEvent) => void) | undefined
}) => (
  <div className='absolute cursor-pointer z-[999] top-4 left-0 md:top-6 md:-left-[60px] '>
    <Space
      size="middle"
      direction='vertical'
    >
      <div onClick={onClose} className='flex p-2.5 bg-white text-slate-500 hover:text-primary border rounded border-primary'>
        <Icon icon='lucide:x' className='stroke-current' size={20} />
      </div>
      <div onClick={onClose} className='flex p-2.5 bg-white text-slate-500 hover:text-primary border rounded border-primary'>
        <Icon icon='lucide:maximize' className='stroke-current' size={20} />
      </div>
    </Space>
  </div>
);

export default Drawer;