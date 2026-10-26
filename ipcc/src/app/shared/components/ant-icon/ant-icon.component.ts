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

const ICON_REGISTRY: Record<string, any> = {

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

  constructor(private sanitizer: DomSanitizer) { }

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
