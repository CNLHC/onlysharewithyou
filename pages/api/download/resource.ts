import { AuthMiddleware } from "../../../src/libs/auth";
import { getManager, ResourceModel } from "../../../src/libs/models";
import { getHandler } from "../../../src/libs/utils";
import { decrypt_file } from "../../../src/libs/crypto";

const handler = getHandler()

handler.use(AuthMiddleware())

handler.post(async (req, resp) => {
    const uuid = req.body.resource_uuid
    const manager = await getManager()
    const res = await manager.findOneOrFail(ResourceModel, { where: { uuid: uuid } })
    const raw = await decrypt_file(res.encrypted_resource, {
        userkey: req.user,
        iv: res.iv,
        salt: res.salt
    })
    resp.setHeader("Content-Disposition", `attachment; filename="filename.jpg"`)
    resp.setHeader("Content-Type", `image/jpeg`)
    resp.send(raw)
})

export default handler