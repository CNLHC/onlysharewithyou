import { word_array_to_buffer } from "../../src/libs/utils"
import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from "next-connect"
import multer from "multer"
import { getDatasource, ResourceModel } from "../../src/libs/models"
import { AuthMiddleware } from "../../src/libs/auth"
import { encrypt_file } from "../../src/libs/crypto"


const upload = multer({ storage: multer.memoryStorage(), });
const handler = nextConnect<NextApiRequest, NextApiResponse>({
    onError: (e) => {
        console.error("error", e)
    }
});
handler.use(upload.single('resource'))
handler.use(AuthMiddleware())
type MulterFile = {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    buffer: Buffer
    size: number
}

handler.post(async (req, res) => {
    const resource = ((req as any).file) as MulterFile
    const db = await getDatasource()
    const filename = req.body.filename

    const encrypted = await encrypt_file(resource.buffer, req.user)

    const robj = new ResourceModel()
    robj.iv = word_array_to_buffer(encrypted.iv)
    robj.salt = encrypted.osalt
    robj.user_key = req.user
    robj.meta = {
        created_at: new Date(),
        filename: filename
    }
    robj.encrypted_resource = encrypted.content

    await db.createEntityManager().save([robj])
    res.json({ data: robj.uuid })
})

handler.get(async (req, res) => {
    const db = await getDatasource()
    const resources = await (
        db.createEntityManager().find(ResourceModel, {
            select: ["meta", "uuid"],
            where: {
                user_key: req.user
            }
        }))
    res.json({ resources })
    return
})


handler.delete(async (req, res) => {
    const db = await getDatasource()
    const uuid = req.body.resource_uuid
    await db.createQueryBuilder(ResourceModel, 'rm').delete().where("uuid = :uuid", { uuid }).execute()
    res.json({})
    return
})
export default handler

export const config = {
    api: {
        bodyParser: false
    }
}