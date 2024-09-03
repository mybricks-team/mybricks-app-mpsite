import React from 'react'
import ReactDOM from 'react-dom'
import { Modal, ModalProps } from 'antd'

interface GModalProps extends ModalProps {}

function GModal() {
  const container = document.createElement('div')

  container.setAttribute('id', '__global__')

  const hide = function () {
    if (!document.getElementById('__global__')) {
      return
    }
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
  }
  const show = function (props: GModalProps) {
    document.body.appendChild(container)
    ReactDOM.render(
      <Modal
        {...props}
        open={true}
        onCancel={() => hide()}
      />,
      container
    )
  }

  return {
    show,
    hide,
  }
}

export default GModal()
