import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule, Injector, ApplicationRef, DoBootstrap} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {DatePipe} from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { ProcessXElementComponent } from './element/process-x-element.component';
import { ProcedureElementComponent } from './element/procedure-element.component';
import { ProcessElementComponent } from './element/process-element.component';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LayoutsModule} from "./layouts/layouts.module";

// Auth
import {HttpClientModule, HttpClient, HTTP_INTERCEPTORS} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Language
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {AuthInterceptor} from "@core/interceptors/auth.interceptor";
import {OAuthModule, OAuthStorage} from "angular-oauth2-oidc";
import {CrossbarInterceptor} from "@core/interceptors/crossbar.interceptor";
import {SharedModule} from "@shared/shared.module";
import {WebphoneService} from "@core/services/webphone.service";
import {TranslateLangService} from "@core/services/translate-lang.service";
import {PendingChangesGuard} from "@core/guards/pending-changes.guard";
import {InitModule} from "./init/init.module";
import { LanguageService } from '@core/services/language.service';
import { ProcessXElementModule } from './element/process-x-element.module';


// Required for AOT compilation
export function TranslateHttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function TranslateLangServiceFactory(translateLangService: TranslateLangService) {
    return () => translateLangService.load();
}

export function oAuthStorageFactory(): OAuthStorage {
    return localStorage; //sessionStorage
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        InitModule,
        HttpClientModule,
        BrowserAnimationsModule,
        BrowserModule,
        AppRoutingModule,
        LayoutsModule,

        OAuthModule.forRoot(),
        TranslateModule.forRoot({
            defaultLanguage: 'vi',
            loader: {
                provide: TranslateLoader,
                useFactory: (TranslateHttpLoaderFactory),
                deps: [HttpClient]
            }
        }),
        SharedModule,
        ProcessXElementModule,
    ],
    exports: [
        TranslateModule
    ],
    providers: [
        {provide: OAuthStorage, useFactory: oAuthStorageFactory},
        {provide: HTTP_INTERCEPTORS, useClass: CrossbarInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
        DatePipe,
        PendingChangesGuard,
        {
            provide: APP_INITIALIZER,
            useFactory: TranslateLangServiceFactory,
            deps: [TranslateLangService],
            multi: true,
        },
        WebphoneService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule implements DoBootstrap {
    constructor(private injector: Injector) {}

    ngDoBootstrap(appRef: ApplicationRef): void {
        if (typeof window !== 'undefined' && window.customElements) {
            if (!customElements.get('process-procedure-app')) {
                const procEl = createCustomElement(ProcedureElementComponent, { injector: this.injector });
                customElements.define('process-procedure-app', procEl);
            }
            if (!customElements.get('process-management-app')) {
                const procMgmtEl = createCustomElement(ProcessElementComponent, { injector: this.injector });
                customElements.define('process-management-app', procMgmtEl);
            }
            if (!customElements.get('process-x-app')) {
                const element = createCustomElement(ProcessXElementComponent, { injector: this.injector });
                customElements.define('process-x-app', element);
            }
            console.log('[ProcessX] Đã kích hoạt Custom Elements: <process-procedure-app>, <process-management-app>, <process-x-app>');
        }

        // Chỉ bootstrap AppComponent khi chạy standalone trên dev port 4201
        if (typeof window !== 'undefined' && window.location.port === '4201' && document.querySelector('app-root')) {
            appRef.bootstrap(AppComponent);
        }
    }
}
