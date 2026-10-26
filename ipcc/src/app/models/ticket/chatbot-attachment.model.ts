export class ChatBotAttachment {
    image_url?: string;
    subtitle?: any;
    title?: any;
    item_url?: any;
    buttons?: ChatBotButton[];
}

export class ChatBotButton {
    title?: string;
    payload?: string;
    icon?: any;
    url?: any;
    phone_number?: any;
    dest?: any;
}
