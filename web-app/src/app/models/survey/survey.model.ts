
export class SurveyModel {
    serviceName: string;
    style: any;
    isdn: string[];
    surveyName: string;
    forCampaign:  number
    bussinessId:  number // bussinessId: co cau hoi chon 1 dap an
    channelSurvey: string;
    listSurveyAtt: SurveyAttribute [] = []
    isNumber: number
    identification: number
}

export class SurveyAttribute {
    isdn: string;
    surveyAtt: string;
    surveyAttValue: string
}

/*
SURVEYCHAT_USERNAME	username chat với khách hàng.
SURVEYCHAT_CONVERSATION_ID	Mã hội thoại
SURVEYCHAT_AGENTNAME	Tên khách hàng chat
SURVEYCHAT_CONVERSATION_STARTDATE	Thời gian bắt đầu hội thoại
SURVEYCHAT_CONVERSATION_ENDDATE	Thời gian kết thúc hội thoại
SURVEYCHAT_END_CHAT_REASON	Nguyên nhân kết thúc hội thoại
*/
