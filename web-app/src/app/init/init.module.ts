import {APP_INITIALIZER, NgModule} from '@angular/core';
import {AuthService} from "@core/services/auth/auth.service";
import {TokenService} from "./token.service";
import {CbAuthService} from "@core/services/auth/cb-auth.service";
import {forkJoin} from "rxjs";
import {map} from "rxjs/operators";

export function loadConfig(tokenSvc: TokenService, authService: AuthService, cbAuthSvc: CbAuthService) {
    return () => {
        return authService.isLoggedIn().then((loggedIn) => {
            if (loggedIn) {
                const sources = [
                    // cbAuthSvc.maybeRequestKzToken(),
                    tokenSvc.initAuthorizationList()
                ];
                return forkJoin(sources).pipe(map((any) => (null))).toPromise();
            } else {
                return Promise.resolve(); // If the user is not logged in, return an empty promise.
            }
        });
    };
}


@NgModule({
    providers: [
        TokenService,
        {
            provide: APP_INITIALIZER,
            useFactory: loadConfig,
            deps: [TokenService, AuthService, CbAuthService],
            multi: true,
        }
    ]
})
export class InitModule {
}
