import CryptoJS from 'crypto-js'

import { AES_SECRET_KEY } from '@/context/constants'


export const encryptAES = (data: any): string => {
  const plaintext = JSON.stringify(data)
  return CryptoJS.AES.encrypt(plaintext, AES_SECRET_KEY).toString()
}

export const decryptAES = (ciphertext: string): any => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, AES_SECRET_KEY)
  const decrypted = bytes.toString(CryptoJS.enc.Utf8)
  return JSON.parse(decrypted)
}
