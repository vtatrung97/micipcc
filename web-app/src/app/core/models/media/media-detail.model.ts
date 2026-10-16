import {NotificationConfig} from "@core/models/media/notification-config.model";

export class MediaDetail {
    id: string | undefined;
    name: string;
    streamable: boolean = true;
    media_source: string;
    media_code: string;
    description: string;
    language: string;
    content_length: number;
    time_upload: number;
    time_expired: number;
    content_type: string;
    prompt_id: string;
    tts: any;
    text: string;
    realm_name: string;
    group_id: string | undefined;
    media_type: string[];
    create_by: string;
    notification_config: NotificationConfig;
}
