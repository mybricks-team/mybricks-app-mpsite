
export class PreviewStorage {

  fileId = ''

  constructor({ fileId }) {
    this.fileId = fileId
  }

  getFileKeyTemplate = (fileId) => `--preview-${fileId}-`;

  savePreviewPageData = ({ dumpJson, comlibs }) => {
    localStorage.setItem(`--preview-${this.fileId}-`, JSON.stringify(dumpJson))
    localStorage.setItem(`--preview--comlibs--${this.fileId}-`, JSON.stringify(comlibs))
  }

  getPreviewPageData = () => {
    let dumpJson = localStorage.getItem(`--preview-${this.fileId}-`)
    let comlibs = localStorage.getItem(`--preview--comlibs--${this.fileId}-`)

    try {
      dumpJson = JSON.parse(dumpJson)
    } catch (ex) {
      throw ex
    }

    try {
      comlibs = JSON.parse(comlibs)
    } catch (error) {
      
    }

    return { dumpJson, comlibs }
  }
}

