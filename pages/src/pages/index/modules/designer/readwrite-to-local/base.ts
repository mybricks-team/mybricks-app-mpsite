export const hasFSAccess = 'chooseFileSystemEntries' in window || 'showOpenFilePicker' in window

export async function wirteFilesToDir (rootDirHandle, files) {
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (file.path.length === 0) {
      const fileHandle = await rootDirHandle.getFileHandle(file.fileName, {
        create: true
      });
      await writeFile(fileHandle, file.fileString);
    } else if (file.path.length > 0) {
      let finalDirHandle = rootDirHandle
      for (let index = 0; index < file.path.length; index++) {
        const dirname = file.path[index];
        finalDirHandle = await finalDirHandle.getDirectoryHandle(dirname, {
          create: true,
        })
      }
      const fileHandle = await finalDirHandle.getFileHandle(file.fileName, {
        create: true
      });
      await writeFile(fileHandle, file.fileString);
    }
  }
}

export async function writeFile(fileHandle, contents) {
  // 创建一个 FileSystemWritableFileStream 用来写入。
  const writable = await fileHandle.createWritable();

  // 将文件内容写入到流中。
  await writable.write(contents);

  // 关闭文件并将内容写入磁盘。
  await writable.close();
}

/** 对持久化存储的句柄进行权限校验，因为权限并未持久化，建议调用前校验一下 */
export async function verifyPermission(fileHandle, readWrite = true) {
  const options = {};
  if (readWrite) {
    options.mode = 'readwrite';
  }
  // Check if permission was already granted. If so, return true.
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}