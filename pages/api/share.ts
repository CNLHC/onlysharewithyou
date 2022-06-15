import { getDatasource, getManager, ResourceModel, ShareContext, ShareModel } from "../../src/libs/models";
import { getHandler } from "../../src/libs/utils";
import { decrypt_file, encrypt_file } from "../../src/libs/crypto";
import { gen_pdf_with_watermark } from "../../src/libs/pdf";
import { AuthMiddleware } from "../../src/libs/auth";

const handler = getHandler()
handler.use(AuthMiddleware())


export default handler

handler.post(async (req, resp) => {
    const uuid = req.body.resource_uuid
    const context = req.body.context as ShareContext
    const manager = await getManager()
    const shareobj = new ShareModel()
    const resource = await manager.findOneOrFail(ResourceModel, { where: { uuid } })

    const original_file = await decrypt_file(resource.encrypted_resource, { userkey: req.user, iv: resource.iv, salt: resource.salt })
    const watermarked_file = await gen_pdf_with_watermark(original_file, context.watermark_text)

    const encrypted = await encrypt_file(watermarked_file, req.user, { iv: resource.iv, salt: resource.salt })

    shareobj.resource = resource
    shareobj.encrypted_resource = encrypted.content
    shareobj.context = context

    await manager.save(ShareModel, shareobj)

    resp.json({ uuid: shareobj.uuid })
})


handler.get(async (req, res) => {
    const db = await getDatasource()
    const builder = await db.createQueryBuilder(ShareModel, 'sm')
    const uuid = req.query.resource_uuid as string
    const objs = await builder
        .select(['sm.uuid', 'sm.context'])
        .leftJoin("sm.resource", "smr")
        .addSelect(['smr.meta'])
        .where('smr.uuid = :uuid', { uuid }).getMany()
    res.json({ share: objs })
})

handler.delete(async (req, res) => {
    const db = await getDatasource()
    const builder = await db.createQueryBuilder(ShareModel, 'sm')
    const uuid = req.query.share_uuid as string
    await builder.delete().where("uuid=:uuid", { uuid }).execute()
    res.json({})
})