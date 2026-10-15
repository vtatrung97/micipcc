import {KZ_PRIVILEGE_LEVEL} from "../kazoo/common.model";

export interface User {
    deleted: boolean
    createdBy?: string
    email: string
    firstName: string
    id?: number
    kcUserId?: string
    kzAccountId?: string
    kzUserId?: string
    lastName: string
    password?: string
    phoneNumber?: string
    presenceId?: number
    privLevel?: KZ_PRIVILEGE_LEVEL
    synced?: boolean
    tenant?: string
    username: string
}
