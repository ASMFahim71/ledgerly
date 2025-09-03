'use client';

import React from 'react';
import { Drawer, Form, Input, Select, InputNumber, DatePicker, Button, message } from 'antd';
import { Icon } from '~/icons/Icon';
import { useTransactions } from '~/hooks/useTransactions';
import { useCategories } from '~/hooks/useCategories';
import type { CreateTransactionRequest, Transaction, UpdateTransactionRequest } from '~/lib/api';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface AddTransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cashbookId: number;
  transaction?: Transaction | null;
}

const AddTransactionDrawer: React.FC<AddTransactionDrawerProps> = ({
  isOpen,
  onClose,
  cashbookId,
  transaction
}) => {
  interface FormValues extends Omit<CreateTransactionRequest, 'transaction_date'> {
    transaction_date: dayjs.Dayjs;
  }
  const [form] = Form.useForm<FormValues>();
  const { createTransaction, createTransactionMutation, updateTransaction, updateTransactionMutation } = useTransactions();
  const { categories } = useCategories();

  const isEditing = !!transaction;

  React.useEffect(() => {
    if (isOpen) {
      if (transaction) {
        const values = {
          type: transaction.type,
          amount: transaction.amount,
          source_person: transaction.source_person,
          description: transaction.description,
          transaction_date: dayjs(transaction.transaction_date),
          category_ids: (transaction.categories || []).map(c => c.category_id),
        } as FormValues;
        form.setFieldsValue(values);
        setCurrentType(transaction.type);
      } else {
        form.resetFields();
        const values = {
          type: 'expense',
          transaction_date: dayjs(),
        } as FormValues;
        form.setFieldsValue(values);
        setCurrentType('expense');
      }
    }
  }, [isOpen, transaction, form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      // Format payload
      const basePayload = {
        ...values,
        transaction_date: dayjs(values.transaction_date).format('YYYY-MM-DD'),
        cashbook_id: cashbookId,
      } as CreateTransactionRequest & UpdateTransactionRequest;

      if (isEditing && transaction) {
        await updateTransaction({ id: transaction.transaction_id, data: basePayload });
        message.success('Transaction updated successfully!');
      } else {
        await createTransaction(basePayload);
        message.success('Transaction created successfully!');
      }
      form.resetFields();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error(isEditing ? 'Failed to update transaction. Please try again.' : 'Failed to create transaction. Please try again.');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const [categoryOptions, setCategoryOptions] = React.useState<{ value: number; label: React.ReactNode }[]>([]);

  // Filter categories by transaction type
  const getFilteredCategories = React.useCallback((type: 'income' | 'expense') => {
    if (!categories) return [];
    return categories.filter(category => category.type === type);
  }, [categories]);

  // Generate options from filtered categories
  const generateCategoryOptions = React.useCallback((filteredCategories: typeof categories) => {
    return filteredCategories.map((category) => ({
      value: category.category_id,
      label: (
        <div className="flex items-center">
          <Icon
            icon={category.type === 'income' ? 'lucide:trending-up' : 'lucide:trending-down'}
            size={14}
            className={`mr-2 ${category.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
          />
          {category.name}
        </div>
      )
    }));
  }, []);

  // Keep track of current type to update options
  const [currentType, setCurrentType] = React.useState<'income' | 'expense' | undefined>(form.getFieldValue('type'));

  // Update options when type changes
  React.useEffect(() => {
    if (currentType) {
      const filteredCategories = getFilteredCategories(currentType);
      const options = generateCategoryOptions(filteredCategories);
      setCategoryOptions(options);
    } else {
      setCategoryOptions([]);
    }
  }, [currentType, categories, getFilteredCategories, generateCategoryOptions]);

  return (
    <Drawer
      title={
        <div className="flex items-center">
          <Icon icon={isEditing ? 'lucide:pencil' : 'lucide:plus-circle'} size={20} className={`${isEditing ? 'text-blue-600' : 'text-green-600'} mr-2`} />
          <span className="text-lg font-semibold">{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</span>
        </div>
      }
      open={isOpen}
      onClose={handleCancel}
      width={500}
      destroyOnClose
      footer={
        <div className="flex justify-end space-x-3">
          <Button onClick={handleCancel} size="large">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isEditing ? updateTransactionMutation.isPending : createTransactionMutation.isPending}
            disabled={isEditing ? updateTransactionMutation.isPending : createTransactionMutation.isPending}
            className={`${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} border-0`}
            onClick={() => form.submit()}
          >
            {isEditing ? 'Update Transaction' : 'Create Transaction'}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
        initialValues={undefined}
      >
        <Form.Item
          label="Transaction Type"
          name="type"
          rules={[
            { required: true, message: 'Transaction type is required' },
          ]}
        >
          <Select
            size="large"
            onChange={(value) => {
              const type = value as 'income' | 'expense';
              setCurrentType(type);
              // Clear category selection when type changes
              form.setFieldValue('category_ids', []);
            }}
            options={[
              {
                value: 'income',
                label: (
                  <div className="flex items-center">
                    <Icon icon="lucide:trending-up" size={16} className="text-green-600 mr-2" />
                    Income
                  </div>
                )
              },
              {
                value: 'expense',
                label: (
                  <div className="flex items-center">
                    <Icon icon="lucide:trending-down" size={16} className="text-red-600 mr-2" />
                    Expense
                  </div>
                )
              }
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[
            { required: true, message: 'Amount is required' },
            { type: 'number', min: 0.01, message: 'Amount must be greater than 0' },
          ]}
        >
          <InputNumber
            placeholder="0.00"
            prefix="$"
            className="w-full"
            size="large"
            min={0.01 as number}
            step={0.01 as number}
            precision={2}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => Number((value ?? '').replace(/\$\s?|(,*)/g, ''))}
          />
        </Form.Item>

        <Form.Item
          label="Source/Person"
          name="source_person"
          rules={[
            { required: true, message: 'Source/Person is required' },
            { min: 2, message: 'Source/Person must be at least 2 characters' },
            { max: 150, message: 'Source/Person cannot exceed 150 characters' },
          ]}
        >
          <Input
            placeholder="e.g., Salary, Amazon, John Doe"
            prefix={<Icon icon="lucide:user" size={16} className="text-gray-400" />}
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { max: 500, message: 'Description cannot exceed 500 characters' },
          ]}
        >
          <TextArea
            placeholder="Enter transaction description (optional)"
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Transaction Date"
          name="transaction_date"
          rules={[
            { required: true, message: 'Transaction date is required' },
          ]}
        >
          <DatePicker
            className="w-full"
            size="large"
            format="YYYY-MM-DD"
            placeholder="Select date"
          />
        </Form.Item>

        <Form.Item
          label="Categories"
          name="category_ids"
          dependencies={['type']}
        >
          <Select mode="multiple" placeholder="Select categories (optional)" size="large" allowClear showSearch optionFilterProp="label" options={categoryOptions} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddTransactionDrawer;
