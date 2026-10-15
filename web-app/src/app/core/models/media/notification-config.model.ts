import {MessageMediaContact} from "@core/models/media/message-media-contact.model";
import {AlertAction} from "@core/models/media/alert-action.model";

export class NotificationConfig {
    is_active: number;
    sms_brandname_id: string;
    message_media_contacts: MessageMediaContact[];
    alert_actions: AlertAction[];
}
