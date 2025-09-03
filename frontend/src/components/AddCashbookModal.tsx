'use client';

import React from 'react';
import { Modal, Form, Input, InputNumber, Button, message } from 'antd';
import { Icon } from '~/icons/Icon';
import TextBox from '~/components/~core/TextBox';
import { useCashbooks } from '~/hooks/useCashbooks';
import type { CreateCashbookRequest } from '~/lib/api';

interface AddCashbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashbook?: {
    cashbook_id: number;
    name: string;
    description?: string;
    initial_balance: number;
  } | null;
}

const AddCashbookModal: React.FC<AddCashbookModalProps> = ({ isOpen, onClose, cashbook }) => {
  const [form] = Form.useForm<CreateCashbookRequest>();
  const { createCashbook, createCashbookMutation, updateCashbook, updateCashbookMutation } = useCashbooks();

  const isEditing = !!cashbook;

  React.useEffect(() => {
    if (isOpen) {
      if (cashbook) {
        form.setFieldsValue({
          name: cashbook.name,
          description: cashbook.description,
          initial_balance: cashbook.initial_balance,
        } as any);
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, cashbook, form]);

  const handleSubmit = async (values: CreateCashbookRequest) => {
    try {
      if (isEditing && cashbook) {
        await updateCashbook({ id: cashbook.cashbook_id, data: values });
        message.success('Cashbook updated successfully!');
      } else {
        await createCashbook(values);
        message.success('Cashbook created successfully!');
      }
      form.resetFields();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error(isEditing ? 'Failed to update cashbook. Please try again.' : 'Failed to create cashbook. Please try again.');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <Icon icon={isEditing ? 'lucide:pencil' : 'lucide:plus-circle'} size={20} className="text-blue-600 mr-2" />
          <span className="text-lg font-semibold">{isEditing ? 'Edit Cashbook' : 'Create New Cashbook'}</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          label="Cashbook Name"
          name="name"
          rules={[
            { required: true, message: 'Cashbook name is required' },
            { min: 2, message: 'Name must be at least 2 characters' },
            { max: 100, message: 'Name cannot exceed 100 characters' },
          ]}
        >
          <TextBox
            placeholder="Enter cashbook name"
            prefix={<Icon icon="lucide:book-open" size={16} className="text-gray-400" />}
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
          <Input.TextArea
            placeholder="Enter description (optional)"
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Initial Balance"
          name="initial_balance"
          rules={[
            { type: 'number', min: 0, message: 'Initial balance must be non-negative' },
          ]}
        >
          <InputNumber
            placeholder="0.00"
            prefix="$"
            className="w-full"
            size="large"
            min={0}
            step={0.01}
            precision={2}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parser={(value: any) => value!.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <div className="flex justify-end space-x-3 mt-6">
          <Button onClick={handleCancel} size="large">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isEditing ? updateCashbookMutation.isPending : createCashbookMutation.isPending}
            disabled={isEditing ? updateCashbookMutation.isPending : createCashbookMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 border-0"
          >
            {isEditing ? 'Update Cashbook' : 'Create Cashbook'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddCashbookModal;
