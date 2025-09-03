'use client';

import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from './~core/Sidebar';
import { useAuth } from '~/hooks/useAuth';
import { useRouter } from 'next/navigation';

const { Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { isLoadingUser, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingUser, isAuthenticated, router]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <Layout className="min-h-screen">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Content className={`transition-all duration-200`}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
