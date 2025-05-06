import { Utils } from '@mybricks/sdk-for-ai'

export const getAiEncryptData = Utils.getAiEncryptData

// const generateRandomKey = (length) => {
//   const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   let result = "";
//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * chars.length);
//     result += chars[randomIndex];
//   }
//   return result;
// };

// /**
//  * @description 获取加密传输的参数，支持调用 AI 的时候加密传输
//  */
// export function getAiEncryptData(data) {
//   // return data
//   const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
// MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1ITWRl6ePMu7Fhusup2d
// FEz/hCRTE5mUIeGIjtezG5g8ewBdTaR2FRxtTFONYTaaSR6yFXm9k74tkS1/i0Z8
// 7eIV130XydOn4zFhk2sOkG46mQ+lZwJkyVwvMaAOCnHluTIaPMPMV3sYpp3cWspl
// 2H++R5/kOGVm6EG9HivrimQEKDDJLg9owbfWO2kSEM9ZpUHUt29msYq+lDtBrivG
// oodvC8p5H4a/jXKvLtPRGO09ZO3xk1ktS8isc376Ec9L9Zo8wSwaj5Z/Pg7nd7Sa
// tqj5BEj3YH8rSr1dg77ZMMH1lsuzdA0NHmRGYEvWnUoD6dMqjJjufNwAw9D47DQH
// lwIDAQAB
// -----END PUBLIC KEY-----`;

//   // 生成一个随机的AES密钥
//   const AESKey = generateRandomKey(16);

//   // 用AES密钥加密数据
//   const cipher = forge.cipher.createCipher("AES-CBC", AESKey);
//   cipher.start({ iv: AESKey });
//   cipher.update(
//     forge.util.createBuffer(forge.util.encodeUtf8(JSON.stringify(data)))
//   );
//   cipher.finish();
//   const encryptedData = forge.util.encode64(cipher.output.getBytes());

//   // 使用RSA公钥加密AES密钥
//   const publicKey = forge.pki.publicKeyFromPem(PUBLIC_KEY);
//   const encryptedAESKey = forge.util.encode64(publicKey.encrypt(AESKey));

//   return { chatContent: encryptedData, chatKey: encryptedAESKey };
// }
