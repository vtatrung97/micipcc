export interface MenuItem {
  id: string | null;
  label: string | null;
  icon?: string;
  link: string | null;
  subItems: any[];
  isTitle: boolean | null;
  badge?: any;
  parentId: string | null;
  isLayout: boolean | null;
  svg: string | null
  isHide?: boolean;
  name112: string | null;
  nameEn: string | null;
  nameVi: string | null;
}
