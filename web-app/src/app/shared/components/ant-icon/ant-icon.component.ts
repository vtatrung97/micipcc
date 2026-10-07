import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  AlertOutline,
  ApiOutline,
  AppstoreOutline,
  ApartmentOutline,
  BankOutline,
  BarChartOutline,
  BranchesOutline,
  CalendarOutline,
  CheckCircleFill,
  CheckCircleOutline,
  CheckOutline,
  ClockCircleFill,
  ClockCircleOutline,
  CloseCircleFill,
  CloseCircleOutline,
  CloseOutline,
  CopyOutline,
  DatabaseOutline,
  DeleteOutline,
  DeploymentUnitOutline,
  DownOutline,
  EditOutline,
  ExclamationCircleFill,
  ExclamationCircleOutline,
  ExperimentFill,
  FilterOutline,
  ExperimentOutline,
  EyeOutline,
  FileAddOutline,
  FileTextOutline,
  FolderOpenOutline,
  FormOutline,
  FundOutline,
  HistoryOutline,
  IdcardOutline,
  InboxOutline,
  InfoCircleFill,
  InfoCircleOutline,
  Loading3QuartersOutline,
  LoadingOutline,
  LockOutline,
  MailOutline,
  PauseCircleFill,
  PauseCircleOutline,
  PieChartOutline,
  PlayCircleFill,
  PlayCircleOutline,
  PlusOutline,
  ProfileOutline,
  ProjectOutline,
  ReloadOutline,
  RocketOutline,
  SearchOutline,
  SettingOutline,
  ShoppingCartOutline,
  StarFill,
  StarOutline,
  StopFill,
  StopOutline,
  SyncOutline,
  TableOutline,
  TeamOutline,
  ThunderboltFill,
  ThunderboltOutline,
  UserOutline,
  UserSwitchOutline,
  WarningFill,
  WarningOutline
} from '@ant-design/icons-angular/icons';

const ICON_REGISTRY: Record<string, any> = {
  'plus': PlusOutline,
  'edit': EditOutline,
  'delete': DeleteOutline,
  'copy': CopyOutline,
  'eye': EyeOutline,
  'history': HistoryOutline,
  'search': SearchOutline,
  'reload': ReloadOutline,
  'close': CloseOutline,
  'close-circle': CloseCircleOutline,
  'user': UserOutline,
  'user-switch': UserSwitchOutline,
  'team': TeamOutline,
  'star': StarOutline,
  'experiment': ExperimentOutline,
  'file-text': FileTextOutline,
  'file-add': FileAddOutline,
  'folder-open': FolderOpenOutline,
  'appstore': AppstoreOutline,
  'apartment': ApartmentOutline,
  'bank': BankOutline,
  'branches': BranchesOutline,
  'calendar': CalendarOutline,
  'clock-circle': ClockCircleOutline,
  'check-circle': CheckCircleOutline,
  'pause-circle': PauseCircleOutline,
  'play-circle': PlayCircleOutline,
  'stop': StopOutline,
  'rocket': RocketOutline,
  'thunderbolt': ThunderboltOutline,
  'table': TableOutline,
  'form': FormOutline,
  'profile': ProfileOutline,
  'project': ProjectOutline,
  'deployment-unit': DeploymentUnitOutline,
  'setting': SettingOutline,
  'sync': SyncOutline,
  'loading': LoadingOutline,
  'loading-3-quarters': Loading3QuartersOutline,
  'inbox': InboxOutline,
  'lock': LockOutline,
  'warning': WarningOutline,
  'info-circle': InfoCircleOutline,
  'exclamation-circle': ExclamationCircleOutline,
  'down': DownOutline,
  'check': CheckOutline,
  'fund': FundOutline,
  'database': DatabaseOutline,
  'pie-chart': PieChartOutline,
  'bar-chart': BarChartOutline,
  'alert': AlertOutline,
  'api': ApiOutline,
  'mail': MailOutline,
  'idcard': IdcardOutline,
  'shopping-cart': ShoppingCartOutline,
  'star-fill': StarFill,
  'check-circle-fill': CheckCircleFill,
  'clock-circle-fill': ClockCircleFill,
  'pause-circle-fill': PauseCircleFill,
  'play-circle-fill': PlayCircleFill,
  'stop-fill': StopFill,
  'close-circle-fill': CloseCircleFill,
  'warning-fill': WarningFill,
  'info-circle-fill': InfoCircleFill,
  'exclamation-circle-fill': ExclamationCircleFill,
  'thunderbolt-fill': ThunderboltFill,
  'experiment-fill': ExperimentFill,
  'filter': FilterOutline
};

@Component({
  selector: 'ant-icon',
  templateUrl: './ant-icon.component.html',
  styleUrls: ['./ant-icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AntIconComponent implements OnInit, OnChanges {
  @Input() name: string = '';
  @Input() theme: 'outline' | 'fill' = 'outline';
  @Input() size?: number | string;
  @Input() color?: string;
  @Input() spin: boolean = false;
  @Input() rotate?: number;

  trustedSvg: SafeHtml | null = null;
  parsedSize: string | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.updateSvg();
    this.updateSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['name'] || changes['theme']) {
      this.updateSvg();
    }
    if (changes['size']) {
      this.updateSize();
    }
  }

  private updateSize(): void {
    if (this.size == null) {
      this.parsedSize = null;
    } else if (typeof this.size === 'number') {
      this.parsedSize = `${this.size}px`;
    } else {
      this.parsedSize = this.size.endsWith('px') || this.size.endsWith('rem') || this.size.endsWith('em')
        ? this.size
        : `${this.size}px`;
    }
  }

  private updateSvg(): void {
    if (!this.name) {
      this.trustedSvg = null;
      return;
    }

    let key = this.name.trim().toLowerCase();
    
    if (this.theme === 'fill' && !key.endsWith('-fill') && ICON_REGISTRY[`${key}-fill`]) {
      key = `${key}-fill`;
    }

    const iconDef = ICON_REGISTRY[key] || ICON_REGISTRY[key.replace(/-o$/, '')] || ICON_REGISTRY['file-text'];
    if (iconDef && iconDef.icon) {
      this.trustedSvg = this.sanitizer.bypassSecurityTrustHtml(iconDef.icon);
    } else {
      this.trustedSvg = null;
    }
  }
}
