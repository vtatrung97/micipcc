export class QualifierModel {
}

export enum AssignManualFileType {
  import_by_call = 1,
  import_by_agent = 2,
  import_by_ticket = 3,
}

export enum FileTemplateName {
  fileTemplateName1 = 'Import_Assign_Quality_By_Call_Template',
  fileTemplateName2 = 'Import_Assign_Quality_By_Agent_Template',
  fileTemplateName3 = 'Import_Assign_Quality_By_Ticket_Template',
}

export class ManualAssignQualifyValidationResponse {
  validRecord: any[];
  invalidCount: number;
  validCount?: number;
  linkUrl: string;
  linkUrlPublic: string;
  filePath: string;
  fileName: string;
  fileSize: number;
}


