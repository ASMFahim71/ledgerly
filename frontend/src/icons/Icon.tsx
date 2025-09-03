import { forwardRef } from "react";
import type {
  IconifyIconHTMLElement,
  IconifyIconProps,
} from "@iconify-icon/react";
import { Icon as IconifyIcon } from "@iconify-icon/react";
import { parseInt } from "lodash";

type Spread<T, K> = Omit<T, keyof K> & K;
type IconProps = Spread<IconifyIconProps, { size?: number | string; }>

const Icon = forwardRef<IconifyIconHTMLElement, IconProps>(({
  size,
  style,
  ...rest
}, ref) => {
  const fontSize = size ? `${parseInt(`${size}`)}px` : "";

  return <IconifyIcon
    ref={ref}
    style={{ ...style, fontSize }}
    noobserver
    {...rest} />;
});
Icon.displayName = "Icon";
export { Icon };