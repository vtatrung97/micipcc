import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {DatePipe} from '@angular/common';
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
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent]
})
export class AppModule {
}
