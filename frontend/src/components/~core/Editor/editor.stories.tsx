import type { Meta, StoryObj } from '@storybook/react';
import Editor from '.';

const meta = {
  title: 'Editor',
  component: Editor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
  },
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onChange: () => {}, // Dummy function to satisfy TypeScript
  },
};
