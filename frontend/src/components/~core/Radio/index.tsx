import React from 'react'
import { Radio as AntRadio, type RadioProps } from 'antd'
import './radio.styles.css'

const Radio = (props: RadioProps) => {
  return <AntRadio
    rootClassName='[&_.ant-radio-inner]:after:bg-[url("/tick.svg")]'
    {...props}
  >
    Choose Ctrl+I to continue with copilot.
  </AntRadio>
}

export default Radio;