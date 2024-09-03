import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useMemo } from "react"
import Icon from './Icon'
import { createPortal } from "react-dom"
import style from './style.less'

interface OpenProps {
  type: 'success' | 'error'
  content: string
}

interface UseToastProps {
  open: ({ type, content }: OpenProps) => void
  success: (content: string) => void
  error: (content: string) => void
}

let toastCount = 0;

const Toast = forwardRef((props, ref) => {
  const [toastList, setToastList] = useState<any[]>([])

  useImperativeHandle(ref, () => {
    return {
      open: ({ type, content }: OpenProps) => {
        open({ type, content })
      }
    }
  })

  const open = ({ type, content }: OpenProps) => {
    const toast = {
      id: getUuid(),
      type,
      content
    }

    setToastList((prevToasts) => [...prevToasts, toast])
  }

  const close = (id: string) => {
    setToastList((prevToasts) => {
      return prevToasts.filter(item => item.id !== id)
    })
  }

  return createPortal((
    <div className={style.toast}>
      {
        toastList.map(item => {
          return <ToastItem {...item} onClose={close} key={item.id} />
        })
      }
    </div>
  ), document.body)
})

const getUuid = () => {
    return 'toast' + new Date().getTime() + '-' + toastCount++;
};

function ToastItem ({ id, type, content, onClose }: { id: string, type: 'success' | 'error', content: string, onClose: (id: string) => void}) {
  const timer = useRef<any>()
  const duration = 2000

  useEffect(() => {
    timer.current = setTimeout(() => {
      if (onClose) {
        onClose(id);
      }
    }, duration)

    return () => {
      clearTimeout(timer.current)
    }
  }, [])

  return (
    <div className={style.toastItem}>
      <div className={style.toastItemContent}>
        <Icon type={type} />
        <span className={style.toastItemContentText}>{content}</span>
      </div>
    </div>
  )
}

export default function useToast(): [UseToastProps, React.ReactElement] {
  const toastRef = React.useRef<any>();

  const contextHolder = (
    <Toast ref={toastRef} />
  );

  const api = useMemo(() => {
    return {
      open: ({ type, content }: OpenProps) => {
        toastRef.current?.open({ type, content })
      },
      success : (content: string) => {
        toastRef.current?.open({ type: 'success', content })
      },
      error : (content: string) => {
        toastRef.current?.open({ type: 'error', content })
      }
    }
  }, [])

  return [api, contextHolder]
}