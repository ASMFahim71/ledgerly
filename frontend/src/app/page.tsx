'use client';

import { Typography } from 'antd';
import { Icon } from '~/icons/Icon';
import Link from 'next/link';

const { Text } = Typography;

const HomePage = () => {
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

      {/* Action Cards */}
      <div className="bg-white/90 backdrop-blur-sm border-0 flex-1 py-8 px-52">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Ledgerly
          </h2>
          <Text className="text-lg text-gray-600">
            Choose how you&apos;d like to get started
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
          {/* Login Card */}
          <Link href="/login" className="block">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-center text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Icon icon="lucide:log-in" size={48} className="mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Sign In</h3>
              <Text className="text-blue-100">
                Welcome back! Sign in to your account
              </Text>
            </div>
          </Link>

          {/* Register Card */}
          <Link href="/register" className="block">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-center text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Icon icon="lucide:user-plus" size={48} className="mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Create Account</h3>
              <Text className="text-green-100">
                Join Ledgerly and start tracking your finances
              </Text>
            </div>
          </Link>
        </div>

        <div className="text-center mt-8">
          <Text className="text-gray-600">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </div>
      </div>
    </div>
  );
};

export default HomePage;