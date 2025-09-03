import type { Meta, StoryObj } from '@storybook/react';
import { DrawerProps, Space } from "antd";
import Drawer from '.';
import useToggle from "~/hooks/useToggle";
import Button from '../Button';
import { Button as AntButton } from 'antd';
import { Icon } from '~/icons/Icon';

const DrawerWrapper = (props: DrawerProps) => {
  const [open, toggle] = useToggle(false);

  return <>
    <Button
      onClick={toggle}
      size="large"
      type="primary"
      icon={
        <Icon icon='lucide:maximize' size={20} />
      }
    >
      Open Drawer
    </Button>
    <Drawer open={open} onClose={toggle} {...props}>Hello</Drawer>
  </>;
}

const meta = {
  title: 'Core/Drawer',
  component: DrawerWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    title: 'Settings',
    placement: 'right',
    size: 'default',
    extra: null,
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ...meta.args,
    closable: true,
  },
};

export const WithLoading: Story = {
  args: {
    ...meta.args,
    loading: true,
  },
};

export const WithExtras: Story = {
  args: {
    ...meta.args,
    closable: false,
    extra: (
      <Space>
        <AntButton size='large'>Cancel</AntButton>
        <AntButton size='large' type="primary">OK</AntButton>
      </Space>
    )
  },
};

export const LargeSize: Story = {
  args: {
    ...meta.args,
    size: "large",
  },
};