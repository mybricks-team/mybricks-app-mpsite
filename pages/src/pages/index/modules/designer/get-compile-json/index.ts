import { GetMiniappJson } from './get-miniapp-json'
import { GetH5Json } from './get-h5-json'

export const getMiniappJson = new GetMiniappJson().getJson;

export const getH5Json = new GetH5Json().getJson;