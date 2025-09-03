import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { options } from '~/lib/constants';

import { Select } from '.';
import './select.styles.css';
import { Icon } from '~/icons/Icon';

const meta = {
  title: 'Core/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  args: {
    suffixIcon: <Icon icon='lucide:chevron-down' size={18} />,
    onChange: fn(),
    options,
    style: {
      fontFamily: 'Outfit, sans-serif',
      padding: 10,
      borderRadius: 8,
      width: 400
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rootClassName: 'select-override',
    allowClear: true
  },
};

export const Multiple: Story = {
  args: {
    mode: "multiple",
  },
};

export const VariantBorderless: Story = {
  args: {
    prefix: "Concurrency",
    variant: "borderless",
    suffixIcon: <Icon icon='lucide:chevrons-up-down' size={18} />
  },
};

export const AsCascader: Story = {
  args: {
    isCascader: true,
  },
};
