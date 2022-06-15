import { message } from "antd";
import Axios, { AxiosInstance } from "axios";
import download from "downloadjs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "react-use";
import useSWR from "swr";
import { AuthContext } from "../../pages/_app";
import { LoadingContext } from "./loading";
import { ResourceMeta, ShareContext } from "./models";

export function useUserKey() {
    const [key, setKey, logout] = useLocalStorage<string>('key', ""); // specify a type argument for your type
    const [isValid, setValid] = useState(false)
    useEffect(() => {
        const valid = (key?.length ?? 0) > 0
        setValid(valid)
    }, [key])
    return { key, setKey, isValid, logout }
}

export function useAuthedClient() {
    // const key: string | undefined = "ZgbguJKj6jqoyyKS5pP4nnN0vS2jY0QllXdu84xlezc=" as string | undefined
    const { key } = useContext(AuthContext)
    const cli: AxiosInstance | undefined = useMemo(() => {
        if (key) return Axios.create({
            headers: {
                Authorization: `${key}`
            }
        })
        return undefined;
    }, [key])
    return cli
}

export type ResourceBrief = {
    uuid: string
    meta: ResourceMeta
}
export function useResources() {
    const cli = useAuthedClient()

    const auth = useContext(AuthContext);
    const loading = useContext(LoadingContext)

    const list = useCallback(() => {
        if (!cli) return
        loading.loading_on()
        return cli.get<{
            resources: Array<ResourceBrief>
        }>("/api/resource").then(e => e.data.resources).finally(() => loading.loading_off())
    }, [cli, loading])

    const { data, mutate, error } = useSWR(`list-resources-${auth.key}`, list)
    useEffect(() => {
        if (cli)
            mutate()
    }, [cli, mutate])
    useEffect(() => {
        if (error)
            console.error(111, error)
    }, [error])
    return { list, data: data ?? [], mutate }

}

export type ShareBrief = {
    uuid: string,
    context: ShareContext
    resource: {
        meta: ResourceMeta
    }
}

export function useShare(resource?: ResourceBrief) {
    const cli = useAuthedClient()
    const loading = useContext(LoadingContext)

    const auth = useContext(AuthContext);
    const list = useCallback(() => {
        if (!resource || !cli) return undefined
        loading.loading_on()
        return cli.get<{
            share: Array<ShareBrief>
        }>("/api/share", { params: { resource_uuid: resource.uuid } })
            .then(e => e.data.share)
            .finally(() => loading.loading_off())
    }, [cli, resource, loading.loading_on, loading.loading_off])


    const { data, mutate, error } = useSWR(`list-share-${auth.key}`, list)

    useEffect(() => {
        if (resource)
            mutate()
    }, [resource])

    useEffect(() => {
        if (error)
            console.error(error)
    }, [error])


    return { list, data, mutate }

}
export function useShareAction() {
    const cli = useAuthedClient()
    return {
        create: useCallback(
            async (context: ShareContext, resource?: ResourceBrief) => {
                if (!resource || !cli) return
                return cli.post("/api/share", {
                    resource_uuid: resource.uuid,
                    context,
                }).then(e => e.data)
            }, [cli]),
        download: useCallback(async (uuid: string, filename: string) => {
            if (!cli) return
            return cli.post('/api/download/share',
                { share_uuid: uuid },
                { responseType: "blob" }).then(e => download(e.data, filename))
        }, [cli]),
        remove: useCallback(async (uuid: string) => {
            if (!cli) return
            return cli.delete('/api/share', {
                params: { share_uuid: uuid }
            })
        }, [cli])
    }

}
