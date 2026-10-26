import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Pages Routing
import { PagesRoutingModule } from "./pages-routing.module";
import { SharedModule } from "../shared/shared.module";
import { CoreService } from '@core/services/core-service/core-service.service';
import { TemplateService } from '@core/services/ticket-call-flows/template.service';

/**
 * Khi chạy trong IPCC (Module Federation), AppModule của web-app không được nạp
 * → root injector (của Host) không có TranslateService. Đường dẫn i18n phải trỏ về
 * origin của remote, không phải origin của Host.
 */
export function PagesTranslateLoaderFactory(http: HttpClient) {
    const base = ((window as any).env?.SERVICES?.PROCESSX_URL || '.').replace(/\/+$/, '');
    return new TranslateHttpLoader(http, `${base}/assets/i18n/`, '.json');
}

console.log('--- KIỂM TRA IMPORTS PAGES MODULE ---',
    CommonModule,
    FormsModule,
    PagesRoutingModule,
    SharedModule
    // Đưa tất cả các biến module nằm trong mảng imports: [...] vào đây
);

@NgModule({
    declarations: [

    ],
    imports: [
        CommonModule,
        FormsModule,
        // Cung cấp TranslateService ở cấp PagesModule (thay cho root khi chạy remote)
        TranslateModule.forRoot({
            defaultLanguage: 'vi',
            loader: {
                provide: TranslateLoader,
                useFactory: PagesTranslateLoaderFactory,
                deps: [HttpClient]
            }
        }),
        PagesRoutingModule,
        SharedModule,
    ],
    // Override các service providedIn:'root' có inject TranslateService, để chúng được tạo
    // trong injector của PagesModule (nơi có TranslateService) thay vì root của Host.
    // ⚠ Nếu gặp NullInjectorError TranslateService với service khác → thêm service đó vào đây.
    providers: [
        CoreService,
        TemplateService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule {

}
