export class Realm {
  id!: string;
  name!: string;
  enabled!: boolean;
  createAt: number | undefined;
  timezone: string | undefined;
  language: string | undefined;
  taxNumber: string | undefined;
  domain: string | undefined;
  briefName: string | undefined;
  address: string | undefined;
  isPrivate: number | undefined;
  timeZone: number | undefined;
  email: string | undefined;
  kzAccountId: string | undefined;
}


export class RealmsFilterForm {
  name?: string;
}
