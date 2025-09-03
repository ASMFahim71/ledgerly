'use client';

import React from 'react';
import { Pagination as AntPagination, type PaginationProps } from 'antd';
import './pagination.styles.css';
import { Icon } from '~/icons/Icon';

const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
  if (type === 'prev') {
    return <a
      className='justify-self-start prev-next-btn-override'
    >
      <Icon icon='lucide:move-left' width={22} height={22} />
      <span className='hidden lg:inline-flex'>Previous</span>
    </a>;
  }
  if (type === 'next') {
    return <a
      className='justify-self-end justify-end prev-next-btn-override'
    >
      <span className='hidden lg:inline-flex'>Next</span>
      <Icon icon='lucide:move-right' width={22} height={22} />
    </a>;
  }
  return originalElement;
};

const Pagination = ({ simple, showSizeChanger, showQuickJumper, ...props }: PaginationProps) => {
  const width = 1280;

  return <AntPagination
    rootClassName='pagination-override'
    align="center"
    itemRender={itemRender}
    simple={
      width < 490 ? true : simple
    }
    showSizeChanger={
      width < 610 ? false : showSizeChanger
    }
    showQuickJumper={
      width >= 790 ? showQuickJumper : false
    }
    {...props} />;
};

export default Pagination;