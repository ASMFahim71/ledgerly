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

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  root?: string;
}

const RegisterPage = () => {
  const { register: registerUser, registerMutation } = useAuth();
  const [form] = Form.useForm<RegisterFormData>();

  const onSubmit = (values: RegisterFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, root, ...registerData } = values;
    console.log('Form submitted with data:', registerData);
    registerUser(registerData);
  };

  // Handle mutation errors when they occur
  React.useEffect(() => {
    if (registerMutation.error) {
      form.setFields([
        {
          name: 'root',
          errors: [registerMutation.error.message],
        },
      ]);
    }
  }, [registerMutation.error, form]);

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Ledgerly and start tracking your finances"
    >
      <Form
        form={form}
        onFinish={onSubmit}
        layout="vertical"
        className="space-y-6 mx-auto"
      >
        {/* Name Field */}
        <Form.Item
          label="Full Name"
          name="name"
          rules={[
            { required: true, message: 'Full name is required' },
            { min: 2, message: 'Name must be at least 2 characters' },
          ]}
        >
          <TextBox
            placeholder="Enter your full name"
            prefix={<Icon icon="lucide:user" size={16} className="text-gray-400" />}
            size="large"
          />
        </Form.Item>

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
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            },
          ]}
        >
          <TextBox
            type="password"
            placeholder="Create a password"
            prefix={<Icon icon="lucide:lock" size={16} className="text-gray-400" />}
            size="large"
          />
        </Form.Item>

        {/* Confirm Password Field */}
        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <TextBox
            type="password"
            placeholder="Confirm your password"
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
            loading={registerMutation.isPending}
            disabled={registerMutation.isPending}
            className={cn(
              "w-full h-12 bg-green-600 hover:bg-green-700 border-0 text-white font-semibold",
              "!p-0" // Override the default padding from Button component
            )}
          >
            Create Account
          </Button>
        </Form.Item>
      </Form>

      <Divider className="my-8">
        <Text className="text-gray-500">or</Text>
      </Divider>

      <div className="text-center">
        <Text className="text-gray-600">
          Already have an account?{' '}
        </Text>
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          Sign In
        </Link>
      </div>

      <div className="text-center mt-6">
        <Text className="text-gray-500 text-sm">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-blue-600 hover:text-blue-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </Link>
        </Text>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
