export class KeycloakGroup {
  id: string;
  keycloakGroupId?: string;
  name?: string;
  parentGroup?: string;
  realmName?: string;
  type?: number;
  createBy?: string;
  createTime?: number;
  updateBy?: string;
  updateTime?: number;
  status?: number;

  children: [] = [];
}