import {SmsTemplate} from "@models/sms-template/sms-template.model";

export class SmsTemplateValidationResponse {
  validMessages: SmsTemplate[];
  invalidCount: number;
  linkUrl: string;
  linkUrlPublic: string;
  filePath: string;
  fileName: string;
  fileSize: number;
}