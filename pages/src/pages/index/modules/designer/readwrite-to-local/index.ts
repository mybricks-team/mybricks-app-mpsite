import { get, set } from 'idb-keyval'
import { wirteFilesToDir, verifyPermission, hasFSAccess } from './base'

export const supportFSAccess = hasFSAccess

export const writeLocalProject = async (files, {
  fileId,
  type,
}) => {
  const dirHandle = await getRootDirectoryHandle({ fileId });

  try {
    await dirHandle.removeEntry(`project-${fileId}-${type}`, { recursive: true });
  } catch (error) {
    console.error(error)
  }

  /** 判断对应目录是否存在，并获取handle */
  const targetHandle = await dirHandle.getDirectoryHandle(`project-${fileId}-${type}`, {
    create: true,
  })

  await wirteFilesToDir(targetHandle, files)
}

export const showRootDirectoryHandle = ({ fileId }) => {
  window.showDirectoryPicker({
    id: `mpsite_${fileId}`, // 有长度限制，建议短一点
    mode: 'read'
  })
}


export const getCacheRootDirectoryHandle = async ({ fileId }) => {
  const cacheHandle = await get(getFileUUID(fileId))

  if (cacheHandle) {
    await verifyPermission(cacheHandle)
    return cacheHandle;
  }
}

export const selectRootDirectory = async ({ fileId }) => {
  const directoryHandle = await window.showDirectoryPicker({
    id: `mpsite_${fileId}`, // 有长度限制，建议短一点
    mode: 'readwrite'
  })
  await set(getFileUUID(fileId), directoryHandle);

  return directoryHandle
}

/** 获取当前文件可以操作的根目录 */
export const getRootDirectoryHandle = async ({ fileId }) => {

  const cacheHandle = await getCacheRootDirectoryHandle({ fileId })

  if (cacheHandle) {
    return cacheHandle;
  }

  return await selectRootDirectory({ fileId })
}


function getFileUUID (fileId) {
  return `mybricks_mpsite_${fileId}`
}