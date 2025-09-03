```ts
import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#2C6E4A",
    fontFamily: "var(--font-plus-jakarta-sans)",
    colorPrimaryBg: "#2C6E4A",
    colorBgContainer: "#fff",
    colorBorder: "#D0D5DD",
  },
  components: {
    Checkbox: {
      borderRadiusSM: 2,
    },
    Cascader: {
      controlItemWidth: 250,
      menuPadding: 8,
      optionPadding: 12,
      optionSelectedFontWeight: 600,
      dropdownHeight: 360,
    },
    Button: {
      paddingInline: 8,
      groupBorderColor: "none",
      defaultBorderColor: "none",
      defaultBg: "#fff",
      paddingBlock: 8,
    },
    Switch: {
      handleBg: "#fff",
      trackMinWidth: 45,
      trackHeight: 26,
      handleSize: 22,
    },
    Input: {
      activeBorderColor: "#D0D5DD",
      hoverBorderColor: "#D0D5DD",
      activeShadow: "none",
    },
    Breadcrumb: {
      itemColor: "#666",
      lastItemColor: "#666",
    },
    Dropdown: {
      colorBgElevated: "#ffffff",
      borderRadius: 8,
      colorBorder: "#DFE4EA",
      boxShadowSecondary: "0px 24px 16px -16px rgba(112, 147, 195, 0.24)",
      controlItemBgHover: "#F1F6FC",
      fontSizeSM: 14,
      fontSize: 16,
      sizePopupArrow: 24,
      paddingXS: 8,
      borderRadiusOuter: 8,
    },
    Slider: {
      dotActiveBorderColor: "#2C6E4A",
      railHoverBg: "#EAECF0",
      railBg: "#EAECF0",
      handleActiveColor: "#2C6E4A",
      trackHoverBg: "#2C6E4A",
      dotSize: 12,
      handleColor: "#2C6E4A",
      handleSize: 16,
      handleSizeHover: 16,
      railSize: 8,
      trackBg: "#2C6E4A",
      handleLineWidth: 4,
      handleLineWidthHover: 4,
      dotBorderColor: "#2C6E4A",
    },
    Modal: {
      contentBg: "#ffffff",
    },
    Tabs: {
      inkBarColor: "#2C6E4A",
      itemActiveColor: "#2C6E4A",
    },
    Table: {
      borderColor: "#D0D5DD",
      rowHoverBg: "#fff",
    },
    Segmented: {
      itemActiveBg: "#fff",
      itemSelectedBg: "#FFF",
      itemSelectedColor: "#363636",
      trackBg: "#F2F4F7",
      itemHoverBg: "#F2F4F7",
      itemHoverColor: "#363636",
    },
    Select: {
      selectorBg: "#fff",
      optionSelectedBg: "#fff",
      optionActiveBg: "#fff",
      optionSelectedColor: "#2C6E4A",
      zIndexPopup: 1204,
    },
    Menu: {
      itemSelectedBg: "#FAFAFA",
      itemSelectedColor: "#363636",
      itemBorderRadius: 4,
      itemHoverBg: "#FAFAFA",
      itemHoverColor: "#363636",
      iconSize: 20,
      groupTitleFontSize: 16,
      itemHeight: 48,
    },
    Radio: {
      radioSize: 20,
      dotSize: 10,
      buttonBg: "red",
      buttonSolidCheckedActiveBg: "yellow",
      buttonSolidCheckedBg: "violet",
      buttonSolidCheckedColor: "magenta",
      buttonSolidCheckedHoverBg: "green",
    },
    Tooltip: {
      zIndexPopup: 2000,
    },
  },
  cssVar: true,
  hashed: false,
};

export default theme;

```

```tsx
"use client";

import React, { useEffect } from "react";
import { debounce } from "lodash";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { cn } from "~/utils/utils";
import { TextBox } from "~/components/@core/TextBox";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: boolean;
  debounceTimer?: number;
}

const SearchBox = React.forwardRef<HTMLInputElement, Props>(
  ({ className, icon, debounceTimer = 500, ...props }, ref) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const handleSearch = debounce((searchTerm: string) => {
      const currentParams = new URLSearchParams(searchParams);

      if (searchTerm) {
        currentParams.set("query", searchTerm);
      } else {
        currentParams.delete("query");
      }

      router.replace(`${pathname}?${currentParams.toString()}`);
    }, debounceTimer);

    return (
      <TextBox
        variant="search"
        icon
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
        className={cn(
          "px-4 rounded-md bg-white border border-solid border-[#D9E0E8] outline-none focus:outline-1 focus:outline-[#D9E0E8]",
          icon && "pl-10",
          className,
        )}
        style={{
          boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
        }}
        ref={ref}
        {...props} />
    );
  },
);
SearchBox.displayName = "SearchBox";
export { SearchBox };
```
