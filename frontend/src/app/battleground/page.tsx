'use client'

import React from 'react';
import Button from '~/components/~core/Button';
import Cascader from '~/components/~core/Cascader';
import { Select } from '~/components/~core/Select';
import TextBox from '~/components/~core/TextBox';
import { Icon } from '~/icons/Icon';
import { options } from '~/lib/constants';
/* import { useToken } from '~/theme/antd.theme'; */
import { ColorPicker, Flex, Space } from 'antd';
import Drawer from '~/components/~core/Drawer';

import Checkbox from '~/components/~core/Checkbox';
import Toggle from '~/components/~core/Toggle';
import Radio from '~/components/~core/Radio';
import Pagination from '~/components/~core/Pagination';

const BattleGroundPage = () => {
  return <div className='max-w-screen-xl mx-auto flex flex-col items-center justify-center p-10'>
    <div className='flex-1'>
      <TextBox />
      <TextBox inputType='debounced' />
      <TextBox />

      <div className='flex gap-2 my-2'>
        <Button icon={<Icon icon='lucide:folder' size={24} />} />
        <Button asIcon icon={<Icon icon='lucide:ruler' size={24} />} />
      </div>

      <Select options={options} />
      <Select mode='multiple' options={options} variant='borderless' />
      <Select options={options} prefix="Concurrency" />
      <Select mode='multiple' options={options} isCascader maxTagCount={3} />
      <Cascader allowClear placeholder="Please select" />
    </div>

    <div className='max-w-screen-lg mx-auto'>
      {/* <Editor value={html} onChange={(html) => { console.log(html) }} /> */}
      <div
        contentEditable
        className='min-h-80 h-auto p-3 w-full bg-gray-50 outline-none focus:outline-none'>
      </div>
      <Button type='primary'>Submit</Button>

      <div style={{ width: 500, margin: '100px auto' }}>
        <Space direction='vertical' className='w-full'>
          <ColorPicker />
          <Button asIcon icon={<Icon icon='lucide:maximize' size={20} />} />
          <Button type='primary' icon={<Icon icon='lucide:maximize' size={20} />}>Primary</Button>
          <TextBox />
          {/* <DatePicker picker='date' rootClassName='' showTime showWeek showNow onChange={handleChange} style={{ width: '100%' }} /> */}
        </Space>
        {/* <div style={{ marginTop: 16 }}>
          Selected Date: {date ? date.format('YYYY-MM-DD') : 'None'}
        </div> */}
        <Drawer closable={false} />
        {/* {contextHolder} */}

        <Flex vertical gap={10} className='!my-5'>
          <Radio />

          <Toggle id='toggle' />
        </Flex>

        <Checkbox />

        {/* <Select options={options} />
        <Select mode='multiple' options={options} prefix="Status" variant='borderless' />
        {/* <Select mode='multiple' options={options} defaultValue={['Tanvir']} onChange={handleSelectChange} /> */}
      </div>

      <div className='mb-20'>
        <Pagination total={500} showQuickJumper showSizeChanger />
      </div>
    </div>

  </div>;
}

export default BattleGroundPage;
