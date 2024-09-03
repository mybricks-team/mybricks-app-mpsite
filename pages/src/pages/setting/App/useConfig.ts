import React, { useCallback, useEffect, useRef, useState } from 'react'
import API from '@mybricks/sdk-for-app/api'

export type TConfigProps<T = any> = {
  config: T,
  mergeUpdateConfig: (values: Partial<T>) => Promise<void>,
  updateConfig: (values: T) => Promise<void>,
  loading: boolean,
  user: {
    email: string,
  },
  options: any
}

export default <T = any>(namespace, defaultValue = {} as T, options = {}): TConfigProps<T> => {
  const [config, setConfig] = useState<T>(defaultValue)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    API.User.getLoginUser().then(user => {
      setUser(user)
    })
    setLoading(true)
    API.Setting.getSetting([namespace], options).then((res) => {
      try {
        const newConfig = typeof res[namespace]?.config === 'string' ? JSON.parse(res[namespace]?.config) : (res[namespace]?.config || {})
        setConfig(newConfig)
      } catch (error) {
        setConfig({})
        return
      }

    }).finally(() => {
      setLoading(false);
    });
  }, [])

  // 完整更新更新
  const updateConfig = useCallback((values) => {
    setLoading(true)
    return API.Setting.saveSetting(namespace, values, user?.id, options).then(() => {
      setConfig({ ...values });
    }).finally(() => {
      setLoading(false);
    });
  }, [user])

  // 合并更新，参数只提供要修改的部分即可
  const mergeUpdateConfig = useCallback((values: Partial<T>) => {
    return updateConfig({
      ...config,
      ...values
    })
  }, [config, updateConfig])


  return { config, mergeUpdateConfig, updateConfig, loading, user, options }
}