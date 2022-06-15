
import "reflect-metadata"
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { DataSource } from "typeorm"
import { config } from "dotenv";
config()

export type ResourceMeta = {
    created_at: Date
    filename: string
}

@Entity()
export class ResourceModel {
    @PrimaryGeneratedColumn("uuid")
    uuid: string

    @Index()
    @Column({ type: "bytea" })
    user_key: Buffer

    @Column({ type: "bytea" })
    salt: Buffer

    @Column({ type: "bytea" })
    iv: Buffer


    @Column({ type: "bytea" })
    encrypted_resource: Buffer

    @Column({ type: "jsonb" })
    meta: ResourceMeta

    @OneToMany(() => ShareModel, e => e.resource, { cascade: true })
    shares: ShareModel[];
}

export type ShareContext = {
    to: string
    watermark_text: string
    created_at: Date
}

@Entity()
export class ShareModel {
    @PrimaryGeneratedColumn("uuid")
    uuid: string

    @Column({ type: "bytea" })
    encrypted_resource: Buffer

    @Column({ type: "jsonb" })
    context: ShareContext

    @OneToMany(() => ViewLogsModel, e => e.share, { cascade: true })
    logs: ViewLogsModel[]

    @ManyToOne(() => ResourceModel, e => e.shares, { onDelete: "CASCADE" })
    resource: ResourceModel
}


@Entity()
export class ViewLogsModel {
    @PrimaryGeneratedColumn("uuid")
    uuid: string

    @Column({ type: "jsonb" })
    context: any

    @ManyToOne(() => ShareModel, e => e.logs, { onDelete: "CASCADE" })
    share: ShareModel
}




let datasource = new DataSource({
    type: "postgres",
    name: "default",
    host: process.env["PG_HOST"],
    port: parseInt(process.env["PG_PORT"] ?? "5432"),
    database: process.env["PG_DB"],
    username: process.env["PG_USER"],
    password: process.env["PG_PW"],
    connectTimeoutMS: 10000000,
    schema: "oswy",
    entities: [ResourceModel, ShareModel, ViewLogsModel],
    synchronize: true,
    logging: false
})



export async function getDatasource() {
    if (!datasource.isInitialized) {
        datasource = await datasource.initialize()
    }
    return datasource
}

export async function getManager() {
    return getDatasource().then(e => e.createEntityManager())
}

