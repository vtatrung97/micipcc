import { AgentMateBotOption } from "./env.model";

export interface AgentMateConfig {
    // Kết nối
    loaderUrl: string;
    linkUrl: string;

    // Bubble
    bubbleBackgroundColor: string;
    bubbleColor: string;
    bubbleContent: string; // icon url
    bubblePadding: string;
    bubbleBorderRadius: string;
    autoOpenWidget: boolean;

    // Widget / khung chat
    widgetBackgroundColor: string;
    widgetHeaderBackgroundColor: string;
    widgetColor: string;
    contentImg: string;
    contentText: string;
    chatTextSize: string;
    chatLineHeight?: string;

    // Bong bóng chat (assistant / user)
    assistantBackground: string;
    assistantColor: string;
    assistantAvatar: string;
    userBackground: string;
    userColor: string;

    // Footer
    poweredBy: string;
    poweredByColor: string;

    bots: AgentMateBotOption[]
}

/**
 * Map: key của AgentMateConfig -> placeholder token dùng trong agentmate-embed.html
 * Dùng để generic hoá việc replace, không cần sửa service mỗi khi thêm param mới.
 */
export const AGENTMATE_PLACEHOLDER_MAP: Record<keyof AgentMateConfig, string> = {
    bots: '__AGENTMATE_BOT_OPTION__',
    loaderUrl: '__LOADER_URL__',
    linkUrl: '__LINK_URL__',
    bubbleBackgroundColor: '__BUBBLE_BG_COLOR__',
    bubbleColor: '__BUBBLE_COLOR__',
    bubbleContent: '__BUBBLE_CONTENT__',
    bubblePadding: '__BUBBLE_PADDING__',
    bubbleBorderRadius: '__BUBBLE_BORDER_RADIUS__',
    autoOpenWidget: '__AUTO_OPEN_WIDGET__',
    widgetBackgroundColor: '__WIDGET_BG_COLOR__',
    widgetHeaderBackgroundColor: '__WIDGET_HEADER_BG_COLOR__',
    widgetColor: '__WIDGET_COLOR__',
    contentImg: '__CONTENT_IMG__',
    contentText: '__CONTENT_TEXT__',
    chatTextSize: '__CHAT_TEXT_SIZE__',
    chatLineHeight: '__CHAT_LINE_HEIGHT__',
    assistantBackground: '__ASSISTANT_BG__',
    assistantColor: '__ASSISTANT_COLOR__',
    assistantAvatar: '__ASSISTANT_AVATAR__',
    userBackground: '__USER_BG__',
    userColor: '__USER_COLOR__',
    poweredBy: '__POWERED_BY__',
    poweredByColor: '__POWERED_BY_COLOR__',
};
