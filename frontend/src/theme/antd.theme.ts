import type { ThemeConfig } from 'antd';

import {
  theme as AntdTheme
} from 'antd';
export const { useToken } = AntdTheme;

const theme: ThemeConfig = {
  token: {
    fontSize: 16,
    colorPrimary: '#4f46e5',
  },
  components: {
    DatePicker: {
      fontFamily: 'inherit'
    },
    Input: {
      fontFamily: 'inherit',
    },
    InputNumber: {
      fontFamily: 'inherit'
    },
    Checkbox: {
      fontFamily: 'inherit',
    },
    Radio: {
      fontFamily: 'inherit',
    },
    Switch: {
      handleBg: "#fff",
      trackMinWidth: 45,
      trackHeight: 26,
      handleSize: 22,
    },
    ColorPicker: {
      fontFamily: 'inherit',
    },
    Select: {
      fontFamily: 'inherit',
      optionSelectedBg: 'rgba(0,0,0,0.04)',
      optionSelectedFontWeight: 400,
    },
    Breadcrumb: {
      fontFamily: 'inherit',
      itemColor: "#666",
      lastItemColor: "#666",
    },
    Pagination: {
      fontFamily: 'inherit',
      itemActiveBg: 'white',
      itemBg: "transparent",
      itemSize: 38,
      itemSizeSM: 38,
      controlHeight: 38,
    },
    Cascader: {
      controlHeight: 48,
      /* controlWidth: 280, */
      colorBorder: '#666',
      menuPadding: 8,
      optionSelectedColor: "#fff",
      optionPadding: 12,
      optionSelectedFontWeight: 400,
      dropdownHeight: 360,
    },
    Slider: {
      dotActiveBorderColor: '#4f46e5',
      railHoverBg: '#EAECF0',
      railBg: '#EAECF0',
      handleActiveColor: '#4f46e5',
      trackHoverBg: '#4f46e5',
      dotSize: 10,
      handleColor: '#4f46e5',
      handleSize: 10,
      handleSizeHover: 16,
      railSize: 8,
      trackBg: '#4f46e5',
      handleLineWidth: 4,
      handleLineWidthHover: 4,
      dotBorderColor: '#4f46e5',
    }
  }
};

export default theme;