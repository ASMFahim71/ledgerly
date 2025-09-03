'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  Button, 
  Table, 
  Space, 
  Tag, 
  Popconfirm, 
  message, 
  Row, 
  Col, 
  Typography,
  Empty,
  Spin
} from 'antd';
// Using project Icon (lucide) instead of Ant icons
import { useCategories } from '~/hooks/useCategories';
import { Category } from '~/lib/api';
import CategoryForm from '../../components/CategoryForm';
import useToggle from '~/hooks/useToggle';
import { Icon } from '~/icons/Icon';

const { Title, Text } = Typography;

const CategoriesPage: React.FC = () => {
  const router = useRouter();
  const {
    categories,
    isLoadingCategories,
    categoriesError,
    categoryStats,
    isLoadingStats,
    deleteCategory,
    deleteCategoryAsync,
    deleteCategoryMutation,
  } = useCategories();

  const [isFormOpen, toggleFormOpen] = useToggle(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    toggleFormOpen();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategoryAsync(id);
      message.success('Category deleted successfully');
    } catch (error) {
      message.error('Failed to delete category');
    }
  };

  const handleFormClose = () => {
    setEditingCategory(null);
    toggleFormOpen();
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: 'income' | 'expense') => (
        <Tag 
          color={type === 'income' ? 'green' : 'red'} 
        >
          <Icon icon={type === 'income' ? 'lucide:trending-up' : 'lucide:trending-down'} size={12} className="mr-1" />
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="text"
            icon={<Icon icon="lucide:edit-3" size={16} />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Category"
            description="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.category_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<Icon icon="lucide:trash-2" size={16} />}
              loading={deleteCategoryMutation.isPending}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (categoriesError) {
    return (
      <div className="p-6">
        <Card>
          <Empty 
            description="Failed to load categories" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button
                onClick={() => router.push('/dashboard')}
                className="mr-4"
                icon={<Icon icon="lucide:arrow-left" size={16} />}
              >
                Back to Dashboard
              </Button>
              <Icon icon="lucide:tag" size={32} className="text-blue-600 mr-3" />
              <div>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-0">
                  Category Management
                </Title>
                <Text className="text-gray-600">
                  Manage your income and expense categories
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Total Categories</div>
                <div className="text-2xl font-semibold">{categoryStats?.total_categories || 0}</div>
              </div>
              <Icon icon="lucide:bar-chart-3" size={24} className="text-gray-400" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Income Categories</div>
                <div className="text-2xl font-semibold text-green-600">{categoryStats?.income_categories || 0}</div>
              </div>
              <Icon icon="lucide:trending-up" size={24} className="text-green-500" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Expense Categories</div>
                <div className="text-2xl font-semibold text-red-600">{categoryStats?.expense_categories || 0}</div>
              </div>
              <Icon icon="lucide:trending-down" size={24} className="text-red-500" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">With Transactions</div>
                <div className="text-2xl font-semibold">{categoryStats?.categories_with_transactions || 0}</div>
              </div>
              <Icon icon="lucide:banknote" size={24} className="text-gray-400" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Most Used Categories */}
      {categoryStats?.most_used_categories && categoryStats.most_used_categories.length > 0 && (
        <Card title="Most Used Categories" className="mb-6">
          <Row gutter={[16, 16]}>
            {categoryStats.most_used_categories.map((category) => (
              <Col xs={24} sm={12} md={8} lg={6} key={category.category_id}>
                <Card size="small">
                  <div className="text-center">
                    <Tag 
                      color={category.type === 'income' ? 'green' : 'red'}
                      className="mb-2"
                    >
                      {category.type.toUpperCase()}
                    </Tag>
                    <div className="font-semibold">{category.name}</div>
                    <div className="text-sm text-gray-500">
                      {category.transaction_count} transactions
                    </div>
                    <div className="text-sm font-medium">
                      ${category.total_amount.toLocaleString()}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Categories Table */}
      <Card
        title="All Categories"
        extra={
          <Button
            type="primary"
            icon={<Icon icon="lucide:plus" size={16} />}
            onClick={toggleFormOpen}
          >
            Add Category
          </Button>
        }
      >
        <Spin spinning={isLoadingCategories}>
          <Table
            columns={columns}
            dataSource={categories}
            rowKey="category_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} categories`,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="No categories found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button type="primary" onClick={toggleFormOpen}>
                    Create your first category
                  </Button>
                </Empty>
              ),
            }}
          />
        </Spin>
      </Card>

      {/* Category Form Modal */}
      <CategoryForm
        open={isFormOpen}
        onClose={handleFormClose}
        category={editingCategory}
      />
      </div>
    </div>
  );
};

export default CategoriesPage;
