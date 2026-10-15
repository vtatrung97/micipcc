export class ServicePivot {
  servicePivotId: string;
  name: string;
  description?: string;
  type?: number;
  servicePivotTypeId?: string;
  apiList?: [];
  paramList?: ServicePivotParam[];
  servicePivotName?: string;
  apiId?: string;
}

export class ServicePivotSearchForm {
  servicePivotCode?: string;
  servicePivotName?: string;
  servicePivotTypeIds?: [];
  createByList?: [];
  createTimeRange?: object;
  updateByList?: [];
  updateTimeRange?: object;
  groupId: string | null;
}

export class ServicePivotApi {
  servicePivotApiId?: string;
  apiId?: string;
  servicePivotId?: string;
}

export class ServicePivotParam {
  apiId?: string;
  paramId?: string;
  type?: number;
  value?: string;
}
