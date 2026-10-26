import { Directive, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionConfig } from '@core/models/permision.model';
import { TokenService } from 'app/init/token.service';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[hasPermissions]'
})
export class HasPermissionsDirective implements OnDestroy {
    private config: PermissionConfig = { permissions: [], mode: 'AND' };
    private authSubscription?: Subscription;

    constructor(
        private tokenService: TokenService,
        private templateRef: TemplateRef<any>,
        private viewContainerRef: ViewContainerRef
    ) {
        //   this.authSubscription = this.tokenService.authChanged$?.subscribe(() => {
        //     this.updateView();
        //   });
        this.updateView();
    }

    @Input()
    set hasPermissions(config: PermissionConfig) {
        this.config = config;
        this.updateView();
    }

    private updateView(): void {
        const hasPermission = this.tokenService.checkUserPermissions(this.config);
        if (hasPermission) {
            if (this.viewContainerRef.length === 0) {
                this.viewContainerRef.createEmbeddedView(this.templateRef);
            }
        } else {
            this.viewContainerRef.clear();
        }
    }

    ngOnDestroy(): void {
        this.authSubscription?.unsubscribe();
    }
}

// example input
// *hasPermissions="{
//     permissions: [
//       { resourceServer: 'acd-service', rname: 'AUTO_ANSWER_CONFIG', scopes: ['ADD_AUTO_ANSWER_CONFIG']}
//     ],
//     mode: 'OR'
//   }"

