import {
  toCodeTaro,
  generateTaroProjectJson,
  compressImages,
} from '@mybricks/to-code-taro'
import taroConfig from './taroConfig'
import generateTaroProject from './generateTaroProject'

export const compilerTaro = async (params, config) => {
  const { data, projectPath, projectName, fileName, depModules, origin, type } =
    params
  const result = await toCodeTaro(
    {
      ...data,
      rootConfig: {
        status: data.status,
      },
    },
    taroConfig,
  )
  const compressed = await compressImages(result, {
    png: { compressionLevel: 9, palette: true, effort: 10 },
    jpeg: { quality: 80 },
  })
  const projectJson = generateTaroProjectJson(compressed)

  await generateTaroProject({
    exportDir: projectPath,
    projectJson,
  })
}
