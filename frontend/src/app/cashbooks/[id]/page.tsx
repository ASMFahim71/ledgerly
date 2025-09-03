'use client';

import React, { useState } from 'react';
import { Typography, Button, Table, Tag, Card, message, Statistic, Row, Col, Space, Popconfirm } from 'antd';
import { Icon } from '~/icons/Icon';
import { useAuth } from '~/hooks/useAuth';
import { useCashbooks } from '~/hooks/useCashbooks';
import { useTransactions } from '~/hooks/useTransactions';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import AddTransactionDrawer from '~/components/AddTransactionDrawer';
import CategoryAssignmentModal from '~/components/CategoryAssignmentModal';
import type { Transaction } from '~/lib/api';

const { Title, Text } = Typography;

const CashbookDetailPage = () => {
  const { user, isLoadingUser, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cashbookId = Number(params.id);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Get cashbook data
  const { cashbooks, isLoadingCashbooks } = useCashbooks();
  const cashbook = cashbooks.find(c => c.cashbook_id === cashbookId);

  // Get transactions for this cashbook
  const {
    transactions,
    isLoadingTransactions,
    transactionStats,
    deleteTransaction,
    deleteTransactionMutation,
  } = useTransactions(cashbookId);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingUser, isAuthenticated, router]);

  // Redirect to dashboard if cashbook not found
  useEffect(() => {
    if (!isLoadingCashbooks && !cashbook) {
      message.error('Cashbook not found');
      router.push('/dashboard');
    }
  }, [isLoadingCashbooks, cashbook, router]);

  // Transactions table columns
  const transactionColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: 'income' | 'expense') => (
        <Tag color={type === 'income' ? 'green' : 'red'} className="font-medium">
          {type === 'income' ? 'Income' : 'Expense'}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Transaction) => (
        <span className={`font-semibold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {record.type === 'income' ? '+' : '-'}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source_person',
      key: 'source_person',
      render: (source: string) => (
        <span className="font-medium">{source}</span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Text className="text-gray-600" ellipsis={{ tooltip: description }}>
          {description || '-'}
        </Text>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      render: (date: string) => (
        <Text className="text-gray-600">
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: 'Categories',
      dataIndex: 'categories',
      key: 'categories',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (categories: any[]) => (
        <Space wrap>
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <Tag
                key={category.category_id}
                color={category.type === 'income' ? 'green' : 'red'}
              >
                <Icon
                  icon={category.type === 'income' ? 'lucide:trending-up' : 'lucide:trending-down'}
                  size={10}
                  className="mr-1"
                />
                {category.name}
              </Tag>
            ))
          ) : (
            <Text type="secondary" className="text-xs">No categories</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Transaction) => (
        <Space>
          <Button
            size="small"
            type="primary"
            className="bg-blue-600 hover:bg-blue-700 border-0"
            onClick={() => {
              setEditingTransaction(record);
              setIsDrawerOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            className="bg-purple-600 hover:bg-purple-700 border-0 text-white"
            onClick={() => handleManageCategories(record)}
          >
            <Icon icon="lucide:tag" size={12} className="mr-1" />
            Categories
          </Button>
          <Popconfirm
            title="Delete Transaction"
            description="Are you sure you want to delete this transaction?"
            onConfirm={() => handleDeleteTransaction(record.transaction_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              danger
              loading={deleteTransactionMutation.isPending}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDeleteTransaction = async (id: number) => {
    try {
      await deleteTransaction(id);
      message.success('Transaction deleted successfully!');
    } catch {
      message.error('Failed to delete transaction. Please try again.');
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleAddTransaction = () => {
    setIsDrawerOpen(true);
  };

  const handleManageCategories = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsCategoryModalOpen(true);
  };

  const handleCategoryModalClose = () => {
    setSelectedTransaction(null);
    setIsCategoryModalOpen(false);
  };

  if (isLoadingUser || isLoadingCashbooks) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Text className="text-gray-600">Loading...</Text>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !cashbook) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button
                onClick={handleBackToDashboard}
                className="mr-4"
                icon={<Icon icon="lucide:arrow-left" size={16} />}
              >
                Back
              </Button>
              <Icon icon="lucide:book-open" size={32} className="text-blue-600 mr-3" />
              <div>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-0">
                  {cashbook.name}
                </Title>
                <Text className="text-gray-600">
                  {cashbook.description || 'No description'}
                </Text>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                type="link"
                onClick={() => router.push('/categories')}
                className="text-gray-600 hover:text-blue-600"
              >
                <Icon icon="lucide:tag" size={16} className="mr-1" />
                Categories
              </Button>
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
        {/* Cashbook Stats */}
        <Row gutter={16} className="mb-8">
          <Col span={6}>
            <Card className="shadow-md">
              <Statistic
                title="Current Balance"
                value={cashbook.current_balance}
                precision={2}
                prefix="$"
                valueStyle={{ color: cashbook.current_balance >= 0 ? '#10b981' : '#ef4444' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="shadow-md">
              <Statistic
                title="Initial Balance"
                value={cashbook.initial_balance}
                precision={2}
                prefix="$"
                valueStyle={{ color: '#6b7280' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="shadow-md">
              <Statistic
                title="Total Transactions"
                value={transactions.length}
                valueStyle={{ color: '#3b82f6' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="shadow-md">
              <Statistic
                title="Status"
                value={cashbook.is_active ? 'Active' : 'Inactive'}
                valueStyle={{ color: cashbook.is_active ? '#10b981' : '#ef4444' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Transaction Stats */}
        {transactionStats && (
          <Row gutter={16} className="mb-8">
            <Col span={8}>
              <Card className="shadow-md">
                <Statistic
                  title="Total Income"
                  value={transactionStats.total_income}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#10b981' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="shadow-md">
                <Statistic
                  title="Total Expenses"
                  value={transactionStats.total_expenses}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#ef4444' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="shadow-md">
                <Statistic
                  title="Net Amount"
                  value={transactionStats.net_amount}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: transactionStats.net_amount >= 0 ? '#10b981' : '#ef4444' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Transactions Table */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon icon="lucide:list" size={20} className="text-blue-600 mr-2" />
                <span className="text-lg font-semibold">Transaction History</span>
              </div>
              <Button
                type="primary"
                className="bg-green-600 hover:bg-green-700 border-0"
                onClick={handleAddTransaction}
              >
                <Icon icon="lucide:plus" size={16} className="mr-1" />
                Add Transaction
              </Button>
            </div>
          }
          className="shadow-md"
        >
          <Table
            dataSource={transactions}
            columns={transactionColumns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`,
            }}
            rowKey="transaction_id"
            className="custom-table"
            loading={isLoadingTransactions}
            locale={{
              emptyText: (
                <div className="text-center py-8">
                  <Icon icon="lucide:receipt" size={48} className="text-gray-300 mx-auto mb-4" />
                  <Text className="text-gray-500">No transactions found</Text>
                  <br />
                  <Text className="text-gray-400 text-sm">Add your first transaction to get started</Text>
                </div>
              ),
            }}
          />
        </Card>
      </div>

      {/* Add Transaction Drawer */}
      <AddTransactionDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingTransaction(null);
        }}
        cashbookId={cashbookId}
        transaction={editingTransaction}
      />

      {/* Category Assignment Modal */}
      <CategoryAssignmentModal
        open={isCategoryModalOpen}
        onClose={handleCategoryModalClose}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default CashbookDetailPage;
