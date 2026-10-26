import {Injectable, isDevMode} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from '../services/auth/auth.service';
import {TokenService} from "../../init/token.service";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthService, private tokenSvc: TokenService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        isDevMode() && console.debug('check active route', state.url);

        return this.authService.isLoggedIn().then(loggedIn => {
            if (this.tokenSvc.checkRouter(state.url)) {
                return Promise.resolve(true);
            } else {
                this.router.navigate(['/']);
                return Promise.resolve(false);
            }
        });
    }

}
