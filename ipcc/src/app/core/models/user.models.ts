export class User {
  id?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  token?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  skills?: string;
  role?: string;
  /** Danh sách role dùng cho AgentMate setUser (vd: ["IPCC","SUPERVISOR"]) */
  roles?: string[];
  website?: string;
  description?: string;
  designation?: string;
}

export interface IAccount {
  id: string,
  name: string,
  userName?: string,
  group: string,
  surname?: string,
  fullName?: string,
  username?: string,
  email: string,
  department?: string,
  realmRole: string,
  extension: string,
  status: number,
  operatorCode?: string,
  extensionVoIP?: string,
  defaultQueue?: string,
  skillLevel?: string,
  nameChat?: string,
  language?: string,
  hardSkill?: string,
  signature?: string,
  roleName?: string,
  statusName?: string,
}

export interface IUserValidationResponse {
  validRecord: IAccount[];
  invalidCount: number;
  validCount?: number;
  linkUrl?: string;
  linkUrlPublic?: string;
  filePath?: string;
  fileName: string;
  fileSize?: number;
  sessionId?: string;
  totalRow?: number;
}
