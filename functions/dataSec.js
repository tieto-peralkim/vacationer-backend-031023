const crypto = require('crypto');

const algorithm = 'aes-256-cbc'; //Using AES encryption
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encryptCookie(data) {
   let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
   let encrypted = cipher.update(data.toString());

   encrypted = Buffer.concat([encrypted, cipher.final()]);

   return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decryptCookie(data) {
   let iv = Buffer.from(data.iv, 'hex');
   let encryptedData = Buffer.from(data.encryptedData, 'hex');
   let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
   let decrypted = decipher.update(encryptedData);

   decrypted = Buffer.concat([decrypted, decipher.final()]);

   return decrypted.toString();
}


module.exports = { encryptCookie, decryptCookie };