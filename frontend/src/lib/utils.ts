import classnames from "classnames";
import { twMerge } from "tailwind-merge";

/* 
  To know more about tailwind-merge, clsx or classnames
  www.linkedin.com/pulse/understanding-differences-between-clsx-classnames-react-terranova-l5dxf */
type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined;
type ClassDictionary = Record<string, unknown>;
type ClassArray = ClassValue[];

export const cn = (...inputs: ClassValue[]) => twMerge(classnames(inputs));