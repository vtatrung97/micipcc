export class MonitorFilter {
  monitorFilterId: string;
  tableName?: string;
  field: string;
  fieldName: string;
  fieldType: string;
  createTime?: number;
  createBy?: string;
  updateTime?: number;
  updateBy?: string;
  status?: number;
  ordered?: number;
  parentField?: string;
  optional?: number;
  notInDb?: boolean = false;
  dataNotInDb?: {fieldId: string, fieldName: string}[];
  isMoreFilter?: boolean = false;
  selectedValue?: any;
  checked?: boolean = false
}