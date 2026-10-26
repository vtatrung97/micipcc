import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'process-x-element-root',
  template: `
    <div class="process-x-element-wrapper" style="width: 100%; height: 100%; min-height: 500px;">
      <router-outlet></router-outlet>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class ProcessXElementComponent implements OnInit, OnChanges {
  @Input() route = '';
  @Input() token = '';
  @Output() routeChanged = new EventEmitter<string>();

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.routeChanged.emit(e.urlAfterRedirects);
    });
  }

  ngOnInit(): void {
    if (this.route) {
      this.navigateInternal(this.route);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['route'] && !changes['route'].firstChange && this.route) {
      this.navigateInternal(this.route);
    }
    if (changes['token'] && this.token) {
      try {
        localStorage.setItem('access_token', this.token);
      } catch (e) {
        console.warn('[ProcessX WC] Không thể lưu token vào localStorage:', e);
      }
    }
  }

  private navigateInternal(targetRoute: string): void {
    // Chuẩn hóa bỏ dấu gạch chéo thừa ở đầu
    const cleanPath = targetRoute.replace(/^\/+/, '');
    if (cleanPath && !this.router.url.includes(cleanPath)) {
      this.router.navigateByUrl(cleanPath);
    }
  }
}
