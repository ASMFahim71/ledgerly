'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Button, message, Tag, Space, Typography, Divider } from 'antd';
import { useCategories } from '~/hooks/useCategories';
import { Transaction, Category } from '~/lib/api';
import { Icon } from '~/icons/Icon';

const { Text } = Typography;
const { Option } = Select;

interface CategoryAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const CategoryAssignmentModal: React.FC<CategoryAssignmentModalProps> = ({ 
  open, 
  onClose, 
  transaction 
}) => {
  const [form] = Form.useForm();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  
  const {
    categories,
    assignCategoryToTransaction,
    assignCategoryMutation,
    removeCategoryFromTransaction,
    removeCategoryMutation,
  } = useCategories();

  const isLoading = assignCategoryMutation.isPending || removeCategoryMutation.isPending;

  useEffect(() => {
    if (open && transaction) {
      const currentCategoryIds = transaction.categories?.map(cat => cat.category_id) || [];
      setSelectedCategories(currentCategoryIds);
      form.setFieldsValue({
        category_ids: currentCategoryIds,
      });
    }
  }, [open, transaction, form]);

  const handleSubmit = async (values: { category_ids: number[] }) => {
    if (!transaction) return;

    try {
      const currentCategoryIds = transaction.categories?.map(cat => cat.category_id) || [];
      const newCategoryIds = values.category_ids || [];

      // Find categories to add
      const categoriesToAdd = newCategoryIds.filter(id => !currentCategoryIds.includes(id));
      
      // Find categories to remove
      const categoriesToRemove = currentCategoryIds.filter(id => !newCategoryIds.includes(id));

      // Add new categories
      for (const categoryId of categoriesToAdd) {
        await assignCategoryToTransaction({
          transaction_id: transaction.transaction_id,
          category_id: categoryId,
        });
      }

      // Remove categories
      for (const categoryId of categoriesToRemove) {
        await removeCategoryFromTransaction(transaction.transaction_id, categoryId);
      }

      message.success('Categories updated successfully');
      onClose();
    } catch (error) {
      message.error('Failed to update categories');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Filter categories by transaction type
  const getFilteredCategories = () => {
    if (!transaction) return [];
    return categories.filter(category => category.type === transaction.type);
  };

  const renderCategoryTag = (category: Category) => (
    <Tag
      key={category.category_id}
      color={category.type === 'income' ? 'green' : 'red'}
      className="mb-1"
    >
      <Icon
        icon={category.type === 'income' ? 'lucide:trending-up' : 'lucide:trending-down'}
        size={12}
        className="mr-1"
      />
      {category.name}
    </Tag>
  );

  if (!transaction) return null;

  return (
    <Modal
      title={
        <div className="flex items-center">
          <Icon icon="lucide:tag" size={20} className="text-blue-600 mr-2" />
          <span>Manage Categories</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="mb-4">
        <Text strong>Transaction Details:</Text>
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <Text strong>{transaction.source_person}</Text>
            <Text className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </div>
          <Text type="secondary" className="text-sm">
            {transaction.description || 'No description'}
          </Text>
        </div>
      </div>

      <Divider />

      <div className="mb-4">
        <Text strong>Current Categories:</Text>
        <div className="mt-2">
          {transaction.categories && transaction.categories.length > 0 ? (
            <Space wrap>
              {transaction.categories.map(renderCategoryTag)}
            </Space>
          ) : (
            <Text type="secondary">No categories assigned</Text>
          )}
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="category_ids"
          label={`Select ${transaction.type} Categories`}
        >
          <Select
            mode="multiple"
            placeholder={`Select ${transaction.type} categories`}
            allowClear
            showSearch
            optionFilterProp="children"
            size="large"
          >
            {getFilteredCategories().map((category) => (
              <Option key={category.category_id} value={category.category_id}>
                <div className="flex items-center">
                  <Icon
                    icon={category.type === 'income' ? 'lucide:trending-up' : 'lucide:trending-down'}
                    size={14}
                    className={`mr-2 ${category.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                  />
                  {category.name}
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end space-x-2">
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
            >
              Update Categories
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryAssignmentModal;
