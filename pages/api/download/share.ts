import { AuthMiddleware } from "../../../src/libs/auth";
import { getDatasource, ShareModel } from "../../../src/libs/models";
import { getHandler } from "../../../src/libs/utils";
import { decrypt_file } from "../../../src/libs/crypto";

const handler = getHandler()

handler.use(AuthMiddleware())

handler.post(async (req, resp) => {
    const uuid = req.body.share_uuid
    const db = await getDatasource()
    const builder = await db.createQueryBuilder(ShareModel, 'sm')

    const obj = await builder
        .select(['sm.uuid', 'sm.context', 'sm.encrypted_resource'])
        .leftJoin("sm.resource", "smr")
        .addSelect(['smr.meta', 'smr.iv', 'smr.salt'])
        .where('sm.uuid = :uuid', { uuid })
        .getOneOrFail()

    const raw = await decrypt_file(obj.encrypted_resource, {
        userkey: req.user,
        iv: obj.resource.iv,
        salt: obj.resource.salt
    })
    resp.send(raw)
})

export default handler