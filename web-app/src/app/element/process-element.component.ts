import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'process-management-element',
  template: `
    <div class="process-management-root" style="width: 100%; height: 100%; min-height: 500px;">
      <router-outlet></router-outlet>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class ProcessElementComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    if (!this.router.url.includes('process-management')) {
      this.router.navigateByUrl('process-management');
    }
  }
}
