'use client';

import React, { useState } from 'react';
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
  Statistic,
  Typography,
  Divider,
  Empty,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useCategories } from '~/hooks/useCategories';
import { Category } from '~/lib/api';
import CategoryForm from '~/components/CategoryForm';
import { useToggle } from '~/hooks/useToggle';

const { Title, Text } = Typography;

const CategoriesPage: React.FC = () => {
  const {
    categories,
    isLoadingCategories,
    categoriesError,
    categoryStats,
    isLoadingStats,
    deleteCategory,
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
      await deleteCategory(id);
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
          icon={type === 'income' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        >
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
            icon={<EditOutlined />}
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
              icon={<DeleteOutlined />}
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
    <div className="p-6">
      <div className="mb-6">
        <Title level={2} className="mb-2">
          <BarChartOutlined className="mr-2" />
          Category Management
        </Title>
        <Text type="secondary">
          Manage your income and expense categories
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Categories"
              value={categoryStats?.total_categories || 0}
              prefix={<BarChartOutlined />}
              loading={isLoadingStats}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Income Categories"
              value={categoryStats?.income_categories || 0}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#52c41a' }}
              loading={isLoadingStats}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Expense Categories"
              value={categoryStats?.expense_categories || 0}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              loading={isLoadingStats}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="With Transactions"
              value={categoryStats?.categories_with_transactions || 0}
              prefix={<DollarOutlined />}
              loading={isLoadingStats}
            />
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
            icon={<PlusOutlined />}
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
  );
};

export default CategoriesPage;
