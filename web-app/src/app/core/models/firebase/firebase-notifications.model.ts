import {FirebaseContent} from "@core/models/firebase/firebase-content.model";

export interface FireBaseNotifications {
    app_id? : string;
    contents?: FirebaseContent;
    apns_push_type_override?: string;
    include_player_ids?: string[];
}
