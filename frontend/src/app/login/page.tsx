'use client';

import React from 'react';
import { Typography, Divider, Form } from 'antd';
import { Icon } from '~/icons/Icon';
import Button from '~/components/~core/Button';
import { cn } from '~/lib/utils';
import Link from 'next/link';
import AuthLayout from '~/components/AuthLayout';
import { useAuth } from '~/hooks/useAuth';
import TextBox from '~/components/~core/TextBox';

const { Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
  root?: string;
}

const LoginPage = () => {
  const { login, loginMutation } = useAuth();
  const [form] = Form.useForm<LoginFormData>();

  const onSubmit = (values: LoginFormData) => {
    console.log('Form submitted with data:', values);
    login(values);
  };

  // Handle mutation errors when they occur
  React.useEffect(() => {
    if (loginMutation.error) {
      form.setFields([
        {
          name: 'root',
          errors: [loginMutation.error.message],
        },
      ]);
    }
  }, [loginMutation.error, form]);

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your Ledgerly account"
    >
      <Form
        form={form}
        onFinish={onSubmit}
        layout="vertical"
        className="space-y-6 mx-auto"
      >
        {/* Email Field */}
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
        >
          <TextBox
            placeholder="Enter your email"
            prefix={<Icon icon="lucide:mail" size={16} className="text-gray-400" />}
            size="large"
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Password is required' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <TextBox
            type="password"
            placeholder="Enter your password"
            prefix={<Icon icon="lucide:lock" size={16} className="text-gray-400" />}
            size="large"
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size='large'
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending}
            className={cn(
              "w-full h-12 bg-blue-600 hover:bg-blue-700 border-0 text-white font-semibold",
              "!p-0" // Override the default padding from Button component
            )}
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <Divider className="my-8">
        <Text className="text-gray-500">or</Text>
      </Divider>

      <div className="text-center">
        <Text className="text-gray-600">
          Don&apos;t have an account?{' '}
        </Text>
        <Link
          href="/register"
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          Create Account
        </Link>
      </div>

      <div className="text-center mt-6">
        <Link
          href="/forgot-password"
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Forgot your password?
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
