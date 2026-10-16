type PermissionCheckMode = 'OR' | 'AND';

export interface RequiredPermission {
  resourceServer: string;
  rsname: string;
  scopes?: string[];
}

export interface PermissionConfig {
  permissions: RequiredPermission[];
  mode?: PermissionCheckMode; // mặc định là 'AND'
}
