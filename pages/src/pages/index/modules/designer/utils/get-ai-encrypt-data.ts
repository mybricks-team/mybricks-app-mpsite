import { Utils } from '@mybricks/sdk-for-ai'

export const aiUtils = {
  get getAiEncryptData () {
    if (window._ai_test_ || localStorage.getItem("_ai_test_")) {
      return (data) => data
    }
    return Utils.getAiEncryptData
  }
}
