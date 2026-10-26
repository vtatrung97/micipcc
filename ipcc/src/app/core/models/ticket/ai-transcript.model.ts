export enum AiTranscriptStatus {
    SUCCESS = 1,
    FAILED = 2
}

export interface AiTranscript {
    callId?: string;
    voicemailBoxId?: string;
    voicemailId?: string;
    transcript?: string;
    status?: AiTranscriptStatus;
    errorMessage?: string;
    createTime?: number;
    /** Tên file Excel AI trích xuất, null nếu không có file */
    fileName?: string;
}
