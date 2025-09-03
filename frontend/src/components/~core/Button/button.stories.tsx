import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import Button from '.';
import { Icon } from '~/icons/Icon';

const meta = {
  title: 'Core/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  args: {
    icon: <Icon icon='lucide:maximize' size={20} />,
    onChange: fn()
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;


export const Primary: Story = {
  args: {
    classNames: {
      icon: 'translate-y-0.5'
    },
    style: {
      fontFamily: 'Outfit, sans-serif',
    },
    className: '',
    type: "primary",
    children: 'Primary Button',
  },
};
