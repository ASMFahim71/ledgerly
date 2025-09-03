'use client';

import { Typography } from 'antd';
import { Icon } from '~/icons/Icon';
import { ReactNode } from 'react';

const { Text } = Typography;

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-stretch justify-center">
      {/* Header */}
      <div className="text-center mb-8 flex-1">
        <div className="flex items-center justify-center mb-4">
          <Icon icon="lucide:wallet" size={48} className="text-blue-600 mr-3" />
          <h1 className="text-6xl font-bold text-gray-600 mb-0">
            Ledgerly
          </h1>
        </div>
        <Text className="text-xl text-gray-600">
          Your Personal Financial Management Solution
        </Text>
      </div>

      {/* Form Container */}
      <div className="bg-white/90 backdrop-blur-sm border-0 flex-1 py-8 px-52">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {title}
          </h2>
          <Text className="text-lg text-gray-600">
            {subtitle}
          </Text>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
