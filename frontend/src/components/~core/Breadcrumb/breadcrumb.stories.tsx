import type { Meta, StoryObj } from '@storybook/react';
import Breadcrumb from '.';

const meta = {
  title: 'Core/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'centered',
  },
  args: {},
  tags: ['autodocs']
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    style: {
      fontFamily: 'Outfit, sans-serif',
    }
  },
};
