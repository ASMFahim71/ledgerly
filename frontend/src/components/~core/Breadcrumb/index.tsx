'use client';

import React from 'react';
import Link from 'next/link';
/* import { usePathname } from 'next/navigation'; */
import { Breadcrumb as AntBreadcrumb, type BreadcrumbProps } from 'antd';

const items = [
  { title: 'Home', },
  { title: <Link href="">Dashboard</Link>, },
  { title: <Link href="">Listings</Link>, },
  { title: 'Manual Nuear', },
]

const Breadcrumb = (props: Omit<BreadcrumbProps, 'items'>) => {
  /* const paths = usePathname().split('/').filter(Boolean);
  const items: Array<{ title: React.ReactNode | string }> = [{ title: <Link href='/'>Home</Link> }];
  let currPath = '';

  paths.forEach((path, i) => {
    currPath += `/${path}`;

    if (i === paths.length - 1) {
      items.push({ title: path });
      return;
    }
    items.push({ title: <Link href={currPath}>{path}</Link> })
  }); */

  return <AntBreadcrumb separator=">" items={items} {...props} />;
}

export default Breadcrumb;