import React from 'react';
import type { Preview } from "@storybook/react";
import '~/app/globals.css';
import theme from '../src/theme/antd.theme';
import { ConfigProvider } from 'antd';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ConfigProvider theme={theme}><Story /></ConfigProvider>
    ),
  ],
};

export default preview;
