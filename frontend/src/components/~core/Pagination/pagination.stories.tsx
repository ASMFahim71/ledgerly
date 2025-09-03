import type { Meta, StoryObj } from '@storybook/react';

import Pagination from '.';
import './pagination.styles.css';

const meta = {
  title: 'Core/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  args: {
    defaultCurrent: 1,
    total: 500,
    rootClassName: 'pagination-override'
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  },
};

export const WithShowQuickJumper: Story = {
  args: {
    showQuickJumper: true,
  },
};