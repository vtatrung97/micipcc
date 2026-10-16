import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SERVICES } from '@env/environment';

export interface AutoResponseResultDTO {
    enablePrivateMsg: boolean;
    enableCommentReply: boolean;
    enableAutoCloseTicket: boolean;

    privateMsg: string;
    commentMsg: string;

    privateFilePaths: FileResultDTO[];
    commentFilePaths: FileResultDTO[];

    linkUrlPublic: string;

    fileName?: string;
    fileSize?: number;
    validCount?: number;
    invalidCount?: number;
}

export interface FileResultDTO {
    fileId: string;
    fileName: string;
    filePath: string;
}

/**
 * Response load tab Xác thực Token Facebook.
 *
 * Backend hiện tại nên trả dạng:
 * {
 *   fbPageId,
 *   pageId,
 *   fbName,
 *   link,
 *   commentToken,
 *   commentExpiredTime,
 *   ...
 *   alertConfig: {
 *     isEnabled,
 *     smsEnabled,
 *     ...
 *   }
 * }
 */
export interface FacebookTokenAuthConfigDTO {
    fbPageId?: string;
    pageId?: string;
    fbName?: string;
    link?: string;
    createBy?: string;
    createTime?: number | null;

    commentToken?: string;
    commentExpiredTime?: number | null;
    commentWarningTime?: number | null;

    inboxToken?: string;
    inboxExpiredTime?: number | null;
    inboxWarningTime?: number | null;

    lastCheckAt?: number | null;
    lastCheckStatus?: string;
    lastErrorCode?: string;
    lastErrorMessage?: string;

    /**
     * Các field flat này để tương thích nếu backend đang trả response dạng cũ.
     * Component hiện tại ưu tiên đọc alertConfig trước.
     */
    enabled?: boolean | null;

    smsEnabled?: boolean | null;
    smsGroupRecipients?: string | null;

    emailEnabled?: boolean | null;
    emailGroupRecipients?: string | null;

    inappEnabled?: boolean | null;
    inappUserIds?: string[];

    alertConfig?: SocialAlertConfigDTO;
}

export interface SocialAlertConfigDTO {
    isEnabled: number;

    title?: string;
    content?: string;

    smsEnabled: number;
    smsGroupRecipients?: string;

    emailEnabled: number;
    emailGroupRecipients?: string;

    inappEnabled: number;
    inappUserIds: string[];
}

/**
 * Request lưu tab Xác thực Token Facebook.
 *
 * Mình giữ cả field flat và alertConfig để:
 * - backend hiện tại đọc được enabled/smsEnabled/emailEnabled/inappEnabled
 * - frontend vẫn giữ được cấu trúc alertConfig dùng cho form
 */
export interface FacebookTokenAuthSaveRequest {
    commentToken?: string;
    commentExpiredTime?: number;
    commentWarningTime?: number;

    inboxToken?: string;
    inboxExpiredTime?: number;
    inboxWarningTime?: number;

    enabled?: boolean;

    smsEnabled?: boolean;
    smsGroupRecipients?: string | null;

    emailEnabled?: boolean;
    emailGroupRecipients?: string | null;

    inappEnabled?: boolean;
    inappUserIds?: string[];

    alertConfig?: SocialAlertConfigDTO;
}

export interface TokenCheckRequest {
    tokenType: 'comment' | 'inbox';
    token?: string;
}

export interface TokenCheckResponse {
    tokenType: 'comment' | 'inbox';
    valid: boolean;
    expiresAt?: number;
    dataAccessExpiresAt?: number;
    scopes?: string[];
    errorCode?: string;
    errorMessage?: string;
}

export interface SelectOptionDTO {
    id: string;
    name: string;
}

@Injectable({ providedIn: 'root' })
export class FacebookPageService {
    constructor(private http: HttpClient) {}

    get SERVICE_URL(): string {
        return `${SERVICES.CHAT_SERVICE_API.url}/api/v1`;
    }

    saveAutoResponseConfig(pageId: string, data: any): Observable<any> {
        return this.http.post(
            `${SERVICES.CHAT_SERVICE_API.url}/api/facebook/pages/${pageId}/autoresponse`,
            data
        );
    }

    getAutoResponseConfig(pageId: string): Observable<any> {
        return this.http.get<AutoResponseResultDTO>(
            `${SERVICES.CHAT_SERVICE_API.url}/api/facebook/pages/${pageId}/autoresponse`
        );
    }

    /**
     * Load cấu hình tab Xác thực Token Facebook.
     */
    getTokenAuthConfig(pageId: string): Observable<FacebookTokenAuthConfigDTO> {
        return this.http.get<any>(
            `${SERVICES.CHAT_SERVICE_API.url}/api/facebook/pages/${pageId}/token-auth`
        ).pipe(
            map((res: any) => this.unwrapData<FacebookTokenAuthConfigDTO>(res))
        );
    }

    /**
     * Lưu cấu hình tab Xác thực Token Facebook.
     */
    saveTokenAuthConfig(pageId: string, data: FacebookTokenAuthSaveRequest): Observable<any> {
        return this.http.post<any>(
            `${SERVICES.CHAT_SERVICE_API.url}/api/facebook/pages/${pageId}/token-auth`,
            data
        ).pipe(
            map((res: any) => this.unwrapData<any>(res))
        );
    }

    /**
     * Kiểm tra token bằng API debug_token phía backend.
     * Hiện tại chỉ dùng khi backend đã có API /token-auth/check.
     */
    checkFacebookToken(pageId: string, data: TokenCheckRequest): Observable<TokenCheckResponse> {
        return this.http.post<any>(
            `${SERVICES.CHAT_SERVICE_API.url}/api/facebook/pages/${pageId}/token-auth/check`,
            data
        ).pipe(
            map((res: any) => this.unwrapData<TokenCheckResponse>(res))
        );
    }

    getSmsGroups(): Observable<SelectOptionDTO[]> {
        return this.http.get<any>(
            `${SERVICES.CCMS_SERVICE_API.url}/api/v1/social-alert/options/sms-groups`
        ).pipe(
            map((res: any) => this.unwrapData<SelectOptionDTO[]>(res) || [])
        );
    }

    getEmailGroups(): Observable<SelectOptionDTO[]> {
        return this.http.get<any>(
            `${SERVICES.TICKET_SERVICE_API.url}/api/v1/social-alert/options/email-groups`
        ).pipe(
            map((res: any) => this.unwrapData<SelectOptionDTO[]>(res) || [])
        );
    }

    getAlertAgents(): Observable<SelectOptionDTO[]> {
        return this.http.get<any>(
            `${SERVICES.ACD_SERVICE_API.url}/api/v1/agents`
        ).pipe(
            map((res: any) => this.unwrapData<SelectOptionDTO[]>(res) || [])
        );
    }

    private unwrapData<T>(res: any): T {
        if (res && Object.prototype.hasOwnProperty.call(res, 'data')) {
            return res.data as T;
        }

        return res as T;
    }
}
