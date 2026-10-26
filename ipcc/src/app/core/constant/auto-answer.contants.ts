import { MESSAGE_TYPE_AUTO_ANWSER, RULE_APPLY_AUTO_ANWSER } from "@core/enums/auto-answer.enum";

export const MESSAGE_TYPES = [
    { label: 'Bắt đầu phiên chat', value: MESSAGE_TYPE_AUTO_ANWSER.START },
    { label: 'Kết thúc phiên chat', value: MESSAGE_TYPE_AUTO_ANWSER.END },
]

export const RULES_APPLY_ALL = [
    { label: 'Gửi khi notify', value: RULE_APPLY_AUTO_ANWSER.SEND_NOTIFY},
    { label: 'Gửi khi ĐTV click vào ticket', value: RULE_APPLY_AUTO_ANWSER.AGENT_CLICK_TICKET },
    { label: 'Khi agent đóng phiên', value: RULE_APPLY_AUTO_ANWSER.AGENT_CLOSE },
    { label: 'Khi hệ thống tự động đóng', value: RULE_APPLY_AUTO_ANWSER.SYSTEM_CLOSE},
    { label: 'Khi agent bỏ qua ticket', value: RULE_APPLY_AUTO_ANWSER.AGENT_IGNORE},
]

export const RULES_APPLY_START = [
    { label: 'Gửi khi notify', value: RULE_APPLY_AUTO_ANWSER.SEND_NOTIFY},
    // { label: 'Gửi khi ĐTV click vào ticket', value: RULE_APPLY_AUTO_ANWSER.AGENT_CLICK_TICKET },
]

export const RULES_APPLY_END = [
    { label: 'Khi agent đóng phiên', value: RULE_APPLY_AUTO_ANWSER.AGENT_CLOSE },
    { label: 'Khi hệ thống tự động đóng', value: RULE_APPLY_AUTO_ANWSER.SYSTEM_CLOSE},
    { label: 'Khi agent bỏ qua ticket', value: RULE_APPLY_AUTO_ANWSER.AGENT_IGNORE},
]

export const PARAMS = [
    { label: 'Xưng hô', value: 'CUSTOMER_GENDER' },
    { label: 'Tên khách hàng', value: 'CUSTOMER_NAME' },
    { label: 'Tên Agent', value: 'AGENT_NAME' },
    { label: 'Tên nguồn', value: 'SOURCE_ID' }
]
