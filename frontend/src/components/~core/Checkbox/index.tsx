import React from 'react'
import { Checkbox as AntCheckbox, type CheckboxProps } from 'antd'

const Checkbox = (props: CheckboxProps) => {
  return <AntCheckbox
    rootClassName='[&_.ant-checkbox-inner]:!h-[19px] [&_.ant-checkbox-inner]:!w-[19px]'
    {...props}
  >
    I accept Terms and Conditions
  </AntCheckbox>
}

export default Checkbox;