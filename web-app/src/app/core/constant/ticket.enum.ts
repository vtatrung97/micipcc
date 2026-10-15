export enum SendStatus {
    SendFail = 0,
    Sent,
    Seen,
    Sending,
    Resending,

    // LƯU Ý: > 4 chỉ lưu các giá trị gửi lỗi

    SendFailBotMaxConnection,
    SendFailBotExistsChatbot,
    SendFailBotChangedWithBot,

    SendFailChatNotInListParticipant,
    SendFailChatConversationEndOrNotFound,
    SendFailBotTimeout

}

export enum ServiceType {
    ChatPortal = 5
}

export enum ChannelId {
    UndefineChannel = 0,
    Voice = 1,
    Email,
    Messenger,
    FacebookPage,
    ChatWeb,
    CallMeBack,
    Zalo,
    Mocha,
    Private,
    ChatInternal,
    Chatbot,
    VideoCall,
    SupportChat,
    Callbot = 14,
    Voicemail = 15,
    QueueBo,
    Whatsapp= 17,
    Telegram,
    Viber,
    Tammi,
    Appstore = 21,
    Chplay = 22,
    Undefined,
    Tiktok=23
}

export enum isReplyChannel {
    voice = 0,
    chat = 1,
    comment = 2,
    email = 3
}

export enum ContactType {
    PhoneNumber = '1',
    Email = "2",
    Messenger = "3",
    Zalo = "4",
    WebPortal = "5",
    SDK= "6",
    mocha='7'
}

export enum ReasonCode {
    OTHER = "OTHER",
    SWITCHED_TO_BOT = "SWITCHED_TO_BOT"
}

export enum ContentType {
    Text = 1,
    File,
    Audio,
    Video,
    VoiceGmsc,
    VoiceOtt,
    Sms,
    Image,
    Location,
    Contact,
    Carousel,
    QuickReply,
    Button,
    Email,
    Sticker,
    Typing,
    Gif,
    Seen,
    Warning = 21,
    End = 22,
    ZaloTemplate = 23,
    TicketNote,
    Hold,
    UnHold,
    Survey = 27,
    Miss = 28,
    CallBack,
    AudioRecording,
    VideoRecording,
    Voicemail = 32,
    Poll = 33,
    Event = 34,
    ChatToMessage = 35
}

export enum MinioFileType {
    Email = 1,
    Social = 2
}

export enum AuthorType {
    CustomerFacebook = 'facebook_user',
    CustomerZalo = 'zalo_user',
    CustomerMocha = 'mocha_user',
    CustomerWeb = 'web_user',
    CustomerTelegram = 'telegram_user',
    Bot = 'bot',
    Page = 'page',
    Agent = 'agent',
    System = 'system'
}

export enum MessageType {
    Customer = 1,
    Agent,
    System,
    Bot,
    Page = 5
}

export enum Gender {
    Undefined,
    Male,
    Female
}

export enum NotiType {
    NewTicket = 1,
    KpiWarning = 2,
    MissedTicket = 3,
    SlaWarning = 4,
    OutsideTicket = 5,
    OtherAgentUpdateTicket = 10,
    TicketTransferredFrom = 11,
    TicketTransferredTo = 12,
    TicketCloseByFieldReportSystem = 21,
    KeywordCheckingWarning = 22,
    CallWaitingWarning = 23,
    NewTicketMiss = 24,
    AlertTicketWarning = 28,
    SocialAlertWarning = 29,
    AlertAccountWarning = 30,
    Undefined
}

export enum NotiCode {
    NEW_TICKET = "NEW_TICKET",
    MISS_TICKET = "MISS_TICKET",
    CHAT_SUPPORT = "CHAT_SUPPORT",
    OUTSIDE_TICKET = "OUTSIDE_TICKET",
    KPI_HOLD_NUM_FAIL = "KPI_HOLD_NUM_FAIL",
    KPI_HOLD_TIME_WARNING = "KPI_HOLD_TIME_WARNING",
    KPI_HOLD_TIME_FAIL = "KPI_HOLD_TIME_FAIL",
    KPI_FIRST_RESPONSE_WARNING = "KPI_FIRST_RESPONSE_WARNING",
    KPI_FIRST_RESPONSE_FAIL = "KPI_FIRST_RESPONSE_FAIL",
    KPI_NEXT_RESPONSE_WARNING = "KPI_NEXT_RESPONSE_WARNING",
    KPI_NEXT_RESPONSE_FAIL = "KPI_NEXT_RESPONSE_FAIL",
    SLA_WARNING = "SLA_WARNING",
    SLA_OVERDUE = "SLA_OVERDUE",
    KPI_TICKET_WARNING = "KPI_TICKET_WARNING",
    KPI_TICKET_OVERDUE = "KPI_TICKET_OVERDUE",
    OTHER_AGENT_UPDATE_TICKET = "OTHER_AGENT_UPDATE_TICKET",
    TICKET_TRANSFERRED_FROM = "TICKET_TRANSFERRED_FROM",
    TICKET_TRANSFERRED_TO = "TICKET_TRANSFERRED_TO",
    TICKET_TRANSFERRED_QUEUE_TO = "TICKET_TRANSFERRED_QUEUE_TO",
    TICKET_LOGOUT_REDISTRIBUTE_FROM = "TICKET_LOGOUT_REDISTRIBUTE_FROM",
    TICKET_LOGOUT_REDISTRIBUTE_TO = "TICKET_LOGOUT_REDISTRIBUTE_TO",
    TICKET_CLOSE_BY_FIELDREPORTSYSTEM = "TICKET_CLOSE_BY_FIELDREPORTSYSTEM",
    KEYWORD_WARNING = "KEYWORD_WARNING",
    ALERT_TICKET_WARNING = "ALERT_TICKET_WARNING",
    SOCIAL_ALERT_WARNING = "SOCIAL_ALERT_WARNING",
    ALERT_ACCOUNT_WARNING = "ALERT_ACCOUNT_WARNING",
}

export enum HoldStatus {
    Hold = 1,
    UnHold = 0
}

export enum NotiReadType {
    UnRead = 0,
    Read
}

export enum MessageFetchDirection {
    Old = 0,
    New,
    Both
}

export enum StatusType {
    Open = 1,
    Close = 2,
    Reopen = 3,
}
export enum MessageDirection {
    In = 1,
    Out = 2,
    InternalNote,
    PublicNote
}

export type LoadingState = "LOADING" | 'LOAD_SUCCESS' | 'LOAD_FAIL' | "INITIAL";

export enum TicketType {
    Ticket = 0,
    Statistic,
    Claim,
}

export enum BlockRange {
    Channel = 1,
    Source,
    Service,
    Customer,
    Contact
}

export enum CreateBlockType {
    AutoBlock = 1,
    ManualBlock
}

export enum BlockType {
    Internal = 1,
    Recurrent
}

export enum CustomerTypeId {
    IdentifiedCustomer = 1,
    AnonymousCustomer
}

export enum DisplayContactType {
    SocialContact = 1,
    NormalContact
}

export enum TicketFilterUpdateType {
    Create = 1,
    Save,
    Copy,
    Rename,
    Delete
}

export enum SortMode {
    REQUEST_TIME_DESC = "REQUEST_TIME_DESC"
}

export type RightSideBarViewMode = "GENERAL_INFO" | "TICKET_INFO" | "CONTENT_SEARCH" | "TICKET_NOTE" | "CALL_INFO" | "SUPPORT_CHAT" | "NEGATIVE_KEYWORD" | "SPECIAL_EMAIL" | "VT_POST"

export enum ROLE {GIAM_SAT = 1, DTV = 0}

export enum STATUS {ACTIVE = 1, INACTIVE = 0};
export enum STATUS_VIEW {VIEW = 1, NOT_VIEW = 0};
