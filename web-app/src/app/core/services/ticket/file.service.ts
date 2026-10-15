import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ToastService } from "@core/services/toast-service";
import { SERVICES } from "@env/environment";
import { AbstractService } from "@core/services/abstract.service";
import { FileUpload } from "@core/models/ticket/ticket.type";
import { ChannelUploadType } from "@core/constant/constant";
import { TranslateService } from "@ngx-translate/core";

import { Observable } from 'rxjs';
import {AuthService} from "@core/services/auth/auth.service";
interface AttachResponse {
  status: string;
  timestamp: number;
  timestampISO8601: string;
  data: {
    AttachId: string;
    request_time: string;
  };
}

@Injectable({ providedIn: 'root' })
export class FileService extends AbstractService {

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService, private authSvc: AuthService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/files`;
    }

    get SERVICE_URL_PUBLIC(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/public/api/v1/files`;
    }

    get REALM_SERVICE_URL_PUBLIC(): string {
        return `${window.location.href}ticket-service/public/api/v1/files`
    }

    public getContentFile(filePath: string, timestamp?: number) {
        return this.getRequestFile(`${this.SERVICE_URL}/content?filePath=${filePath}` + (timestamp ? `&timestamp=${timestamp}` : ''));
    }

    getImportTemplate(){
        return this.getRequestFile(`${SERVICES.CCMS_SERVICE_API.url}/api/v1/customer-groups/template-import`)
    }

    public getContentFileCallLog(accountId: string, recordingId: string, recordingName: string) {
        return this.getRequestFile(`${SERVICES.TICKET_SERVICE_API.url}/public/api/v1/files/content/accounts/${accountId}/recordings/${recordingId}?recordingName=${recordingName}`);
    }
    public getStreamingUrl(accountId: string, recordingId: string, recordingName: string): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/public/api/v1/accounts/${accountId}/recordings/${recordingId}?recordingName=${encodeURIComponent(recordingName)}`;
    }
    public getAttachId(recordingName: string): Observable<AttachResponse> {
        const url = `${SERVICES.TICKET_SERVICE_API.url}/public/api/v1/getTicketAttach?recordingName=${encodeURIComponent(recordingName)}`;
        return this.http.get<AttachResponse>(url);
    }

    public getDownloadUrl(accountId: string, recordingId: string, recordingName: string): string {
       return `${SERVICES.TICKET_SERVICE_API.url}/public/downloadReport/api/v1/files/content/accounts/${accountId}/recordings/${recordingId}/download?recordingName=${encodeURIComponent(recordingName)}`;
    }

    public getContentFilePublic(filePath: string, realmName: string) {
        return this.getRequestFile(this.getURLContentFilePublic(filePath, realmName));
    }
    public streamVideoReport(accountId: string, recordingId: string, recordingName: string) {
        // return `${this.REALM_SERVICE_URL_PUBLIC}/content/streaming?ticketAttachId=${ticketAttachId}&requestTime=${requestTime}&bucket=${bucket}`;
        if (this.authSvc.tenant === 'demo') {
            return `https://demo.moj.gov.vn:8100/ticket-service/public/api/v1/files/content/accounts/${accountId}/recordings/${recordingId}?recordingName=${encodeURIComponent(recordingName)}`;
        } else {
            return `https://cc.vietteltelecom.vn/ticket-service/public/api/v1/files/content/accounts/${accountId}/recordings/${recordingId}?recordingName=${encodeURIComponent(recordingName)}`;
        }
    }

    public getURLContentFilePublic(filePath: string, realmName: string) {
        return `${this.SERVICE_URL_PUBLIC}/content?filePath=${filePath}&realmName=${realmName}`;
    }
    // public streamVideo(ticketAttachId: string, requestTime: number, bucket: string) {
    //     return `${this.SERVICE_URL_PUBLIC}/content/streaming?ticketAttachId=${ticketAttachId}&requestTime=${requestTime}&bucket=${bucket}`;
    // }

    public streamVideo(ticketAttachId: string, requestTime: number, bucket: string) {
        return `${this.SERVICE_URL_PUBLIC}/content/streaming?ticketAttachId=${ticketAttachId}&requestTime=${requestTime}&bucket=${bucket}`;
        // return `https://cc.vietteltelecom.vn/ticket-service/public/api/v1/files/content/streaming?ticketAttachId=${ticketAttachId}&requestTime=${requestTime}&bucket=${bucket}`;
    }

    public uploadFiles(fileList: FileUpload[] | FileUpload, channelType: ChannelUploadType, sourceId?: string) {
        const formData = this.getFormData(fileList, channelType, sourceId);
        return this.postRequest(this.SERVICE_URL, formData);
    }
    public uploadFilesFiledReport(fileList: FileUpload[] | FileUpload, channelType: ChannelUploadType, sourceId?: string) {
        const formData = this.getFormData(fileList, channelType, sourceId);
        const customUploadUrl = `${SERVICES.TICKET_SERVICE_API.url}/api/v1/files/FiledReport-upload`;
        return this.postRequest(customUploadUrl, formData);
    }
    public deleteFileFiledReport(filePath: string) {
        const encoded = encodeURIComponent(filePath);
        return this.http.delete(`${this.SERVICE_URL}/FiledReport-upload?filePath=${encoded}`);
    }

    public uploadFilesPublic(fileList: FileUpload[] | FileUpload, channelType: ChannelUploadType) {
        const formData = this.getFormData(fileList, channelType);
        return this.postRequest(this.SERVICE_URL_PUBLIC, formData);
    }

    public validateImportEmail(file: any) {
        return this.postRequest(`${this.SERVICE_URL}/import-email/validate`, file);
    }

    getFormData(fileList: FileUpload[] | FileUpload, channelType: ChannelUploadType, sourceId?: string) {
        const formData = new FormData();
        if (fileList instanceof File) {
            formData.append('file', fileList);

        } else {
            if (!Array.isArray(fileList)) {
                fileList = [fileList]
            }
            fileList.forEach((file) => {
                formData.append('file', file.fileData, file?.fileName);
            })
        }
        formData.append('channel', channelType);
        if (sourceId) formData.append('sourceId', sourceId);
        return formData;
    }

    public getContentFileTemplTag() {
        return this.http.get(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/ticket-tags/export-template`, {
            // responseType: 'blob',
            // observe: 'response'
            responseType: 'json'
        })
    }

    public getFileExportTicketTag() {
        return this.getRequestFile(`${SERVICES.TICKET_SERVICE_API.url}/api/v1/tickets/export/by-elk`);
    }
}
