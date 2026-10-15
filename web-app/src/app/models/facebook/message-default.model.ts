export class MessageDefaultModel {
    messageDefaultId: string
    content: string | null = ''
    status: number
    domainCode: string
    createTime: number
    createBy: string
    updateTime: number
    updateBy: string
    type: number
    domainId: string
    realmName: string
    startRecord: number
    pageSize: number
    resultSqlEx: boolean


    constructor(content: string) {
        this.content = content;
    }
}