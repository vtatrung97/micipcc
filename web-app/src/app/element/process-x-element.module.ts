import { NgModule, Injector, DoBootstrap, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { createCustomElement } from '@angular/elements';

import { PagesModule } from '../pages/pages.module';
import { ProcessXElementComponent } from './process-x-element.component';
import { ProcedureElementComponent } from './procedure-element.component';
import { ProcessElementComponent } from './process-element.component';

@NgModule({
  declarations: [
    ProcessXElementComponent,
    ProcedureElementComponent,
    ProcessElementComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PagesModule
  ],
  exports: [
    ProcessXElementComponent,
    ProcedureElementComponent,
    ProcessElementComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProcessXElementModule implements DoBootstrap {
  constructor(private injector: Injector) {
    this.registerCustomElements();
  }

  ngDoBootstrap(): void {
    this.registerCustomElements();
  }

  private registerCustomElements(): void {
    if (typeof window !== 'undefined' && window.customElements) {
      // 1. Web component Quản lý quy trình
      if (!customElements.get('process-procedure-app')) {
        const procEl = createCustomElement(ProcedureElementComponent, { injector: this.injector });
        customElements.define('process-procedure-app', procEl);
        console.log(' [ProcessX] Đã đăng ký Web Component: <process-procedure-app>');
      }

      // 2. Web component Quản lý tiến trình
      if (!customElements.get('process-management-app')) {
        const procMgmtEl = createCustomElement(ProcessElementComponent, { injector: this.injector });
        customElements.define('process-management-app', procMgmtEl);
        console.log(' [ProcessX] Đã đăng ký Web Component: <process-management-app>');
      }

      // 3. Web component ProcessX chung (giữ lại tương thích)
      if (!customElements.get('process-x-app')) {
        const element = createCustomElement(ProcessXElementComponent, { injector: this.injector });
        customElements.define('process-x-app', element);
        console.log(' [ProcessX] Đã đăng ký Web Component: <process-x-app>');
      }
    }
  }
}
