'use client';

import React from 'react';
import { Drawer, Form, Input, InputNumber, DatePicker, Select, Button, message } from 'antd';
import { Icon } from '~/icons/Icon';
import { useTransactions } from '~/hooks/useTransactions';
import { useCategories } from '~/hooks/useCategories';
import type { CreateTransactionRequest } from '~/lib/api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface AddTransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cashbookId: number;
}

const AddTransactionDrawer: React.FC<AddTransactionDrawerProps> = ({
  isOpen,
  onClose,
  cashbookId
}) => {
  const [form] = Form.useForm<CreateTransactionRequest>();
  const { createTransaction, createTransactionMutation } = useTransactions();
  const { categories } = useCategories();

  const handleSubmit = async (values: CreateTransactionRequest) => {
    try {
      // Format the date to YYYY-MM-DD
      const formattedValues = {
        ...values,
        transaction_date: dayjs(values.transaction_date).format('YYYY-MM-DD'),
        cashbook_id: cashbookId,
      };

      await createTransaction(formattedValues);
      message.success('Transaction created successfully!');
      form.resetFields();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error('Failed to create transaction. Please try again.');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Filter categories by transaction type
  const getFilteredCategories = (type: 'income' | 'expense') => {
    return categories.filter(category => category.type === type);
  };

  return (
    <Drawer
      title={
        <div className="flex items-center">
          <Icon icon="lucide:plus-circle" size={20} className="text-green-600 mr-2" />
          <span className="text-lg font-semibold">Add New Transaction</span>
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
            loading={createTransactionMutation.isPending}
            disabled={createTransactionMutation.isPending}
            className="bg-green-600 hover:bg-green-700 border-0"
            onClick={() => form.submit()}
          >
            Create Transaction
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
        initialValues={{
          type: 'expense',
          transaction_date: dayjs(),
        }}
      >
        <Form.Item
          label="Transaction Type"
          name="type"
          rules={[
            { required: true, message: 'Transaction type is required' },
          ]}
        >
          <Select size="large">
            <Option value="income">
              <div className="flex items-center">
                <Icon icon="lucide:trending-up" size={16} className="text-green-600 mr-2" />
                Income
              </div>
            </Option>
            <Option value="expense">
              <div className="flex items-center">
                <Icon icon="lucide:trending-down" size={16} className="text-red-600 mr-2" />
                Expense
              </div>
            </Option>
          </Select>
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
            min={0.01}
            step={0.01}
            precision={2}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
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
          <Select
            mode="multiple"
            placeholder="Select categories (optional)"
            size="large"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {form.getFieldValue('type') && getFilteredCategories(form.getFieldValue('type')).map((category) => (
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
      </Form>
    </Drawer>
  );
};

export default AddTransactionDrawer;
