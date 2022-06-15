import { lib } from "crypto-js"
import { LabelInValueType } from "rc-select/lib/Select"
import { buffer_to_word_array, generateKey, word_array_to_buffer } from "./utils"
import CryptoJS from "crypto-js"

export async function decrypt_file(cipher: Buffer, context: {
    userkey: Buffer,
    salt: Buffer,
    iv: Buffer
}) {
    const { key: aes_key } = generateKey(context.userkey.toString("base64"), context.salt)
    const raw_content = CryptoJS.AES.decrypt(cipher.toString("base64"), aes_key, {
        iv: buffer_to_word_array(context.iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    })
    const raw = word_array_to_buffer(raw_content)
    return raw
}

export async function encrypt_file(raw: Buffer, user_key: Buffer, ctx?: {
    iv: Buffer
    salt: Buffer
}) {
    let iv: lib.WordArray
    let isalt: Buffer | undefined
    if (ctx) {
        iv = buffer_to_word_array(ctx.iv)
        isalt = ctx.salt
    } else {
        iv = CryptoJS.lib.WordArray.random(128 / 8);
        isalt = undefined
    }

    const { salt: osalt, key: aes_key } = generateKey(user_key.toString('base64'), isalt)
    const content = CryptoJS.AES.encrypt(buffer_to_word_array(raw), aes_key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    })
    return {
        content: Buffer.from(content.toString(), 'base64'),
        iv,
        osalt
    }
}
