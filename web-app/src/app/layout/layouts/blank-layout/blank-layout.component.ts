import { Component } from '@angular/core';

@Component({
  selector: 'app-blank-layout',
  template: `
    <div class="blank-layout-wrapper">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .blank-layout-wrapper {
      min-height: 100vh;
      width: 100vw;
      background: #f0f2f5;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class BlankLayoutComponent {}
