import {KeycloakGroup} from "@models/ticket/keycloak-group.model";

export class Realm {
  realmId?: string;
  createBy?: string;
  createTime?: number;
  updateBy?: string;
  updateTime?: number;
  status?: number;
  name?: string;
  briefName?: string;
  taxNumber?: string;
  domain?: string;
  address?: string;
  email?: string;
  isPrivate?: number;
  timeZone?: number;
  keycloakGroups: KeycloakGroup[];
}