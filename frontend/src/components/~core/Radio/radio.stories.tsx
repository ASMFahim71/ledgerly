import type { Meta, StoryObj } from '@storybook/react';
import Radio from '.';

const meta = {
  title: 'Core/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  args: {},
  tags: ['autodocs']
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    style: {
      fontFamily: 'Outfit, sans-serif',
    }
  },
};
