import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import CryptoJS from "crypto-js";
import { buffer_to_word_array, word_array_to_buffer } from "./utils";

export function AuthMiddleware() {
    return (req: NextApiRequest, resp: NextApiResponse, next: NextHandler) => {
        const err = Error("没有找到用户身份")
        const key = req.headers.authorization
        if (!key) throw err
        try {
            const key_buf = Buffer.from(key, 'base64')
            const res = CryptoJS.SHA3(buffer_to_word_array(key_buf), { outputLength: 256 })
            req.user = word_array_to_buffer(res)
            next()
        } catch (e) {
            console.error(e)
            throw err
        }
    }
}
