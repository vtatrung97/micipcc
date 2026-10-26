export const ALLOWED_MEDIA = ['audio/mp3', 'audio/wav'];

export class MediaSummary {
    id: string;
    name: string;
    media_source: string;
    language: string;
    is_prompt: boolean;
}

export class MediaDetail {
    id: string;
    name: string;
    streamable: boolean;
    media_source: string;
    description: string;
    language: string;
    content_length: number;
    content_type: string;
    prompt_id: string;
    tts: any = {};
    text: string;

    constructor() {
        this.streamable = true;
        this.media_source = 'upload';
    }
}
