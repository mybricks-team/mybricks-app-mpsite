import * as path from 'path'
import * as fs from 'fs'

const generateTaroProject = async (opts) => {
  const { projectJson, exportDir } = opts || {}

  const processNode = (node, baseDir) => {
    const nodePath = path.join(baseDir, node.path)

    if (node.content === null) {
      if (!fs.existsSync(nodePath)) {
        fs.mkdirSync(nodePath, { recursive: true })
      }

      if (node.children) {
        node.children.forEach((child) => {
          processNode(child, baseDir)
        })
      }
    } else {
      const fileDir = path.dirname(nodePath)

      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true })
      }

      const isImageFile = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(nodePath)
      if (isImageFile && node.content && typeof node.content === 'string') {
        try {
          const buffer = Buffer.from(node.content, 'base64')
          if (buffer.length > 0) {
            fs.writeFileSync(nodePath, buffer)
            return
          }
        } catch (error) {}
      }

      fs.writeFileSync(nodePath, node.content, 'utf-8')
    }
  }

  projectJson.forEach((node) => {
    processNode(node, exportDir)
  })
}

export default generateTaroProject
