export enum FEATURE_LOG {
    HOLD_CALL = 'hold_call',
    UNHOLD_CALL = 'unhold_call',
    INTERGRATE_KB = 'intergrate_kb',
    TAB_EMBEDDED_SCRIPT = 'tab_embedded_script',
    INTERGRATE_BCCS = 'intergrate_bccs',
    INTERGRATE_ORDER = 'intergrate_order',
    TICKET_REPORT_SEARCH = 'ticket_report_search',
    CHAT_REPORT_SEARCH = 'chat_report_search',
    POP_UP_BCCS = 'pop_up_bccs',
    LONG_CALL = "long_call",
    END_NORMAL_CALL = 'end_normal_call',
    TRANSFER_VOICE_TO_VIDEO = 'transfer_voice_to_video',
    TRANSFER_CHAT_TO_VOICE = 'transfer_chat_to_voice',
    TRANSFER_CHAT_TO_VIDEO = 'transfer_chat_to_video',
    NO_ANSWER_3_TIMES = 'no_answer_3_times',
    INTERGRATE_CRM = 'intergrate_crm',
    CUSTOMER_EMOTION_VIEW = 'customer_emotion_view',

    KPI_HOLD_TIME_WARNING = "kpi_hold_time",
    KPI_HOLD_NUM_FAIL = "kpi_hold_number",
    KPI_NEXT_RESPONSE_WARNING = "kpi_next_response",
    KPI_FIRST_RESPONSE_WARNING = "kpi_first_response",

    SLA_TICKET_CHANNEL = "response_sla",
    KPI_RESPONSE_TICKET_CHANNEL = "kpi_response_ticket",

    CLOSE_CHAT_BOT = "close_chat_bot",
    AGENT_END_CHAT = "agent_end_chat",
    CHANGE_LANGUAGE = 'change_language'
}
