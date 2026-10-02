import { Component, Input, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent implements OnInit, OnChanges {
  @Input() loading: boolean = true;
  @Input() tip: string = 'Đang tải dữ liệu...';
  @Input() showTip: boolean = true;
  @Input() type: 'spinner' | 'dots' | 'skeleton' = 'spinner';
  @Input() iconName: string = 'loading'; // Ant Design LoadingOutline
  @Input() size: 'small' | 'default' | 'large' = 'default';
  @Input() color: string = '#1677ff';
  @Input() fullScreen: boolean = false;
  @Input() skeletonRows: number = 3;
  @Input() showSkeletonAvatar: boolean = false;

  skeletonArray: number[] = [];

  ngOnInit(): void {
    this.updateSkeleton();
  }

  ngOnChanges(): void {
    this.updateSkeleton();
  }

  private updateSkeleton(): void {
    this.skeletonArray = Array.from({ length: this.skeletonRows || 3 }, (_, i) => i);
  }

  get iconSize(): number {
    switch (this.size) {
      case 'small': return 18;
      case 'large': return 38;
      default: return 28;
    }
  }
}

