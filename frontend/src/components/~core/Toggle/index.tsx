import React from 'react'
import { Space, Switch, SwitchProps } from 'antd'
import './toggle.styles.css'
import { Icon } from '~/icons/Icon';

const Toggle = (props: SwitchProps) => {
  return <Space>
    <Switch
      className='switch-override'
      checkedChildren={
        <Icon icon='lucide:check' size={20} />
      }
      unCheckedChildren={<Icon icon='lucide:x' size={20} className='-translate-y-1.5' />}
      {...props} />
    <label htmlFor='toggle'>{props.checked ? 'On' : 'Off'}</label>
  </Space>;
}

export default Toggle;