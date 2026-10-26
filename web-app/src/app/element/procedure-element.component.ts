import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'process-procedure-element',
  template: `
    <div class="process-procedure-root" style="width: 100%; height: 100%; min-height: 500px;">
      <router-outlet></router-outlet>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class ProcedureElementComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    if (!this.router.url.includes('procedure-management')) {
      this.router.navigateByUrl('procedure-management');
    }
  }
}
