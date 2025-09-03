import type { Meta, StoryObj } from '@storybook/react';
import Toggle from '.';

const meta = {
  title: 'Core/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  args: {},
  tags: ['autodocs']
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    style: {
      fontFamily: 'Outfit, sans-serif',
    },
    checked: false,
  },
};
