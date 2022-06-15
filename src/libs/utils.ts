import CryptoJS, { lib } from "crypto-js";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

export function generateKey(p: string, salt?: Buffer) {
    let salt_arr: lib.WordArray
    if (salt) {
        salt_arr = CryptoJS.enc.Base64.parse(salt.toString('base64'))
    } else {
        salt_arr = CryptoJS.lib.WordArray.random(128 / 8);
    }
    return {
        salt: word_array_to_buffer(salt_arr),
        key: CryptoJS.PBKDF2(p, salt_arr, { keySize: 512 / 32, iterations: 1000 })
    };
}

export function word_array_to_buffer(wordArray: lib.WordArray) {
    let len = wordArray.words.length,
        u8_array = new Uint8Array(len << 2),
        offset = 0, word, i
        ;
    for (i = 0; i < len; i++) {
        word = wordArray.words[i];
        u8_array[offset++] = word >> 24;
        u8_array[offset++] = (word >> 16) & 0xff;
        u8_array[offset++] = (word >> 8) & 0xff;
        u8_array[offset++] = word & 0xff;
    }
    return Buffer.from(u8_array);
}

export function getHandler() {
    const handler = nextConnect<NextApiRequest, NextApiResponse>({
        onError: (e, req, res) => {
            console.error("error", e)
            res.status(500).json({ msg: e })
        }
    });
    return handler

}

export function buffer_to_word_array(buf: Buffer) {
    return CryptoJS.enc.Base64.parse(buf.toString('base64'))
}

export function generate_userkey() {

}
