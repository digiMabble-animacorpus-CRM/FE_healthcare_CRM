import CryptoJS from 'crypto-js';
import { AES_SECRET_KEY } from '@/context/constants';

export const encryptAES = (data: any): string => {
  if (!AES_SECRET_KEY) {
    throw new Error('AES_SECRET_KEY is not defined');
  }

  const plaintext = JSON.stringify(data);
  return CryptoJS.AES.encrypt(plaintext, AES_SECRET_KEY).toString();
};

export const decryptAES = (ciphertext: string): any => {
  console.log(' Using secret key:', AES_SECRET_KEY);
  console.log(' Cipher before decrypt:', ciphertext);
  const bytes = CryptoJS.AES.decrypt(ciphertext, AES_SECRET_KEY);
  let decrypted = bytes.toString(CryptoJS.enc.Utf8);

  if (!decrypted) throw new Error('Decryption returned empty string');

  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
};
