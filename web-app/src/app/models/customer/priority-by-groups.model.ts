export class BusinessSearchForm {
  code?: string;
  name?: string;
  createByList?: [];
  createTimeRange?: object;
  updateByList?: [];
  updateTimeRange?: object;
  groupId: string | null;
}

export class Business {
  customerGroupPriorityId: string;
  code?: string;
  name?: string;
  description?: string;
  groupId?: string;
  status?: number;
}

export class BusinessCustomerGroup {
  customerGroupPriorityDetailId?: string;
  customerGroupPriorityId: string;
  customerGroupId: string;
  code?: string;
  name?: string;
  priority?: number;
  createBy?: string;
  createTime?: number;
  updateBy?: string;
  updateTime?: number;

  priorityValidationMsg?: string;
}

export class BusinessCustomerGroupValidationResponse {
  validCustomerGroupPriorityDetails: BusinessCustomerGroup[];
  invalidCount: number;
  linkUrl: string;
  linkUrlPublic: string;
  filePath: string;
  fileName: string;
  fileSize: number;
}