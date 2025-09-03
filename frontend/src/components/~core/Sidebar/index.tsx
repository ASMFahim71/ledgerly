'use client';

import React from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '~/icons/Icon';
import { useCashbooks } from '~/hooks/useCashbooks';
import Button from '../Button';

const { Sider } = Layout;

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onCollapse }) => {
  const router = useRouter();
  const pathname = usePathname();

  const { cashbooks = [], isLoadingCashbooks } = useCashbooks();

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <Icon icon="lucide:layout-dashboard" size={16} />,
      label: 'Dashboard',
    },
    {
      key: '/categories',
      icon: <Icon icon="lucide:tag" size={16} />,
      label: 'Categories',
    },
    {
      type: 'divider',
    },
    {
      key: 'cashbooks',
      icon: <Icon icon="lucide:book-open" size={16} />,
      label: 'Cashbooks',
      children: isLoadingCashbooks ? [
        { key: 'loading', label: 'Loading...' }
      ] : cashbooks.map(book => ({
        key: `/cashbooks/${book.cashbook_id}`,
        label: book.name,
        icon: <Icon icon={book.is_active ? 'lucide:book-open' : 'lucide:book'} size={14} />,
      })),
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      className="min-h-screen bg-white/90 backdrop-blur-sm border-r border-gray-200"
      theme="light"
      width={256}
      trigger={
        <div className="h-12 flex items-center justify-center">
          <Button
            type="text"
            asIcon
            icon={<Icon
              icon={collapsed ? "lucide:chevron-right" : "lucide:chevron-left"}
              size={20}
              className="text-gray-500 group-hover:text-blue-600"
            />}
            className="group"
          />
        </div>
      }
      collapsedWidth={80}
    >
      {/* Logo */}
      <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'justify-start'}`}>
        <Icon icon="lucide:wallet" size={32} className="text-blue-600" />
        {!collapsed && (
          <span className="ml-2 text-xl font-bold text-gray-800">Ledgerly</span>
        )}
      </div>

      {/* Navigation Menu */}
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        defaultOpenKeys={['/cashbooks']}
        items={menuItems}
        onClick={({ key }) => router.push(key)}
        className="border-0"
      />
    </Sider>
  );
};

export default Sidebar;
