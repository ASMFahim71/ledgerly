'use client';

import React, { useState } from 'react';
import { Typography, Button, Table, Tag, Timeline, Card, message, Popconfirm } from 'antd';
import { Icon } from '~/icons/Icon';
import { useAuth } from '~/hooks/useAuth';
import { useCashbooks } from '~/hooks/useCashbooks';
import { useTransactions } from '~/hooks/useTransactions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AddCashbookModal from '~/components/AddCashbookModal';
import DashboardLayout from '~/components/DashboardLayout';
import type { Cashbook } from '~/lib/api';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { user, isLoadingUser, logout, isAuthenticated } = useAuth();
  const { cashbooks, isLoadingCashbooks, deleteCashbook, deleteCashbookMutation } = useCashbooks();
  const { transactions, transactionStats } = useTransactions();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCashbook, setEditingCashbook] = useState<Cashbook | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingUser, isAuthenticated, router]);

  // Cashbooks table columns
  const cashbookColumns = [
    {
      title: 'Cashbook Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div className="flex items-center">
          <Icon icon="lucide:book-open" size={16} className="text-blue-600 mr-2" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Balance',
      dataIndex: 'current_balance',
      key: 'current_balance',
      render: (balance: number) => (
        <span className={`font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'} className="font-medium">
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <Text className="text-gray-600 text-sm">
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Cashbook) => (
        <div className="flex space-x-2">
          <Button
            size="small"
            type="primary"
            className="bg-blue-600 hover:bg-blue-700 border-0"
            onClick={() => router.push(`/cashbooks/${record.cashbook_id}`)}
          >
            View
          </Button>
          <Button
            size="small"
            className="border-gray-300"
            onClick={() => {
              setEditingCashbook(record);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Cashbook"
            description="Are you sure you want to delete this cashbook?"
            onConfirm={() => handleDeleteCashbook(record.cashbook_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              danger
              loading={deleteCashbookMutation.isPending}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleDeleteCashbook = async (id: number) => {
    try {
      await deleteCashbook(id);
      message.success('Cashbook deleted successfully!');
    } catch {
      message.error('Failed to delete cashbook. Please try again.');
    }
  };

  const handleOpenModal = () => {
    setEditingCashbook(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCashbook(null);
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Text className="text-gray-600">Loading...</Text>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Title level={2} className="text-2xl font-bold text-gray-800 mb-0">
                Dashboard Overview
              </Title>
              <div className="flex items-center space-x-4">
                <Text className="text-gray-600">
                  Welcome, {user?.name}!
                </Text>
                <Button
                  onClick={() => logout()}
                  className="bg-red-600 hover:bg-red-700 border-0 text-white"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <Title level={1} className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to Your Dashboard
            </Title>
            <Text className="text-xl text-gray-600">
              Start managing your finances with Ledgerly
            </Text>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <Icon icon="lucide:book-open" size={24} className="text-blue-600 mr-3" />
                <Title level={3} className="text-lg font-semibold text-gray-800 mb-0">
                  Cashbooks
                </Title>
              </div>
              <Text className="text-3xl font-bold text-blue-600">
                {isLoadingCashbooks ? '...' : cashbooks.length}
              </Text>
              <Text className="text-gray-600">&nbsp; Total cashbooks</Text>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <Icon icon="lucide:trending-up" size={24} className="text-green-600 mr-3" />
                <Title level={3} className="text-lg font-semibold text-gray-800 mb-0">
                  Income
                </Title>
              </div>
              <Text className="text-3xl font-bold text-green-600">
                ${transactionStats?.stats?.total_income?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
              </Text>
              <Text className="text-gray-600">&nbsp; This month</Text>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <Icon icon="lucide:trending-down" size={24} className="text-red-600 mr-3" />
                <Title level={3} className="text-lg font-semibold text-gray-800 mb-0">
                  Expenses
                </Title>
              </div>
              <Text className="text-3xl font-bold text-red-600">
                ${transactionStats?.stats?.total_expenses?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
              </Text>
              <Text className="text-gray-600">&nbsp; This month</Text>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cashbooks Table - 2/3 width */}
            <div className="lg:col-span-2">
              <Card
                title={
                  <div className="flex items-center">
                    <Icon icon="lucide:book-open" size={20} className="text-blue-600 mr-2" />
                    <span className="text-lg font-semibold">Your Cashbooks</span>
                  </div>
                }
                className="shadow-md"
                extra={
                  <Button
                    type="primary"
                    className="bg-blue-600 hover:bg-blue-700 border-0"
                    onClick={handleOpenModal}
                  >
                    <Icon icon="lucide:plus" size={16} className="mr-1" />
                    New Cashbook
                  </Button>
                }
              >
                <Table
                  dataSource={cashbooks}
                  columns={cashbookColumns}
                  pagination={false}
                  rowKey="cashbook_id"
                  className="custom-table"
                  loading={isLoadingCashbooks}
                  locale={{
                    emptyText: (
                      <div className="text-center py-8">
                        <Icon icon="lucide:book-open" size={48} className="text-gray-300 mx-auto mb-4" />
                        <Text className="text-gray-500">No cashbooks found</Text>
                        <br />
                        <Text className="text-gray-400 text-sm">Create your first cashbook to get started</Text>
                      </div>
                    ),
                  }}
                />
              </Card>
            </div>

            {/* Recent Transactions Timeline - 1/3 width */}
            <div className="lg:col-span-1">
              <Card
                title={
                  <div className="flex items-center">
                    <Icon icon="lucide:clock" size={20} className="text-green-600 mr-2" />
                    <span className="text-lg font-semibold">Recent Transactions</span>
                  </div>
                }
                className="shadow-md"
              >
                <Timeline
                  items={transactions.slice(0, 5).map((transaction) => ({
                    color: transaction.type === 'income' ? 'green' : 'red',
                    children: (
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-1">
                          <Text className="font-medium text-gray-800">
                            {transaction.source_person}
                          </Text>
                          <Text className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Text className="text-gray-500 text-xs">
                              {transaction.description || 'No description'}
                            </Text>
                          </div>
                          <Text className="text-gray-400 text-xs">
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                          </Text>
                        </div>
                      </div>
                    ),
                  }))}
                />
              </Card>
            </div>
          </div>
        </div>

        {/* Add Cashbook Modal */}
        <AddCashbookModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          cashbook={editingCashbook}
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
