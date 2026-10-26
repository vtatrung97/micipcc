export class CampaignScript {
    campaignId: string;
    campaignScriptId?: string
    scriptType: number;
    emailFrom: string;
    emailSubject: string;
    content: string;
    deleteAttachId?: any;
    isGroup: number;
    lstCampaignScriptAttach?: CampaignScriptAttachDTO[]
}

export class CampaignType {
    campaignTypeId: string;
    campaignTypeName: string;
}

export class CampaignScriptAttachDTO {
     campaignId: string;
     fileName: string;
     fileSize: number;
     storeFilePath: string;
     description: string;
     contentType?: string
}
