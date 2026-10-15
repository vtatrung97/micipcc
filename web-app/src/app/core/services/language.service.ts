import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from "ngx-cookie-service";
import {SettingsService} from "@core/services/settings.service";
import {CountLogApiService} from "@core/services/count-log-api.service";
import {FEATURE_LOG} from "@core/constant/count-log-api.constant";

@Injectable({providedIn: 'root'})
export class LanguageService {

    public languages: string[] = ['vi', 'en', '112'];

    constructor(
        public translate: TranslateService,
        private cookieService: CookieService,
        private settingsService: SettingsService,
        private countLogApiSvc: CountLogApiService
    ) {
        /***
         * cookie Language Get
         */
        let browserLang: any;
        this.translate.addLangs(this.languages);
        const hostname = window.location.hostname;
        const domain = hostname.split('.')[0];
        if (this.cookieService.get('lang')) {
            browserLang = this.cookieService.get('lang');
        } else if (domain === 'tongdai112') {
            browserLang = '112'
            this.setLanguage('112')
        } else  {
            browserLang = 'vi';
            this.cookieService.set('lang', browserLang);
        }
        translate.use(browserLang.match(/vi|en|112/) ? browserLang : 'vi');
    }

    /***
     * Cookie Language set
     */
    public setLanguage(lang: any) {
        this.countLogApiSvc.logFeature(FEATURE_LOG.CHANGE_LANGUAGE).subscribe();
        this.translate.use(lang).subscribe(() => {
            this.settingsService.setLanguage(lang);
            this.cookieService.set('lang', lang);
            localStorage.setItem('language', lang)
            window.location.reload();
        });
    }


    /***
     * Cookie Language get
     */
    public getLanguage(): string {
        return this.cookieService.get('lang')
    }
}
