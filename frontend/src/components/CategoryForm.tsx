'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { useCategories } from '~/hooks/useCategories';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '~/lib/api';

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ open, onClose, category }) => {
  const [form] = Form.useForm();
  const {
    createCategory,
    createCategoryMutation,
    updateCategory,
    updateCategoryMutation,
  } = useCategories();

  const isEditing = !!category;
  const isLoading = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  useEffect(() => {
    if (open) {
      if (category) {
        form.setFieldsValue({
          name: category.name,
          type: category.type,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, category, form]);

  const handleSubmit = async (values: CreateCategoryRequest) => {
    try {
      if (isEditing && category) {
        const updateData: UpdateCategoryRequest = {
          name: values.name,
          type: values.type,
        };
        await updateCategory({ id: category.category_id, data: updateData });
        message.success('Category updated successfully');
      } else {
        await createCategory(values);
        message.success('Category created successfully');
      }
      onClose();
    } catch (error) {
      message.error(isEditing ? 'Failed to update category' : 'Failed to create category');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEditing ? 'Edit Category' : 'Create New Category'}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="Category Name"
          rules={[
            { required: true, message: 'Please enter category name' },
            { min: 2, message: 'Name must be at least 2 characters' },
            { max: 100, message: 'Name must not exceed 100 characters' },
          ]}
        >
          <Input placeholder="Enter category name" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Category Type"
          rules={[{ required: true, message: 'Please select category type' }]}
        >
          <Select placeholder="Select category type">
            <Select.Option value="income">Income</Select.Option>
            <Select.Option value="expense">Expense</Select.Option>
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
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryForm;
