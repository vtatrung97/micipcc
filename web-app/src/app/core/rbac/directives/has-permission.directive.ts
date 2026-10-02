import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RbacService } from '../services/rbac.service';
import { ActionPermission, ResourceType } from '../models/rbac.types';

@Directive({
  selector: '[hasPermission]'
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private currentResource?: ResourceType;
  private currentAction: ActionPermission = 'view';
  private hasView: boolean = false;
  private sub: Subscription = new Subscription();

  @Input() set hasPermission(val: string | { resource: ResourceType; action?: ActionPermission }) {
    if (typeof val === 'string') {
      const parts = val.split(':');
      this.currentResource = parts[0] as ResourceType;
      this.currentAction = (parts[1] || 'view') as ActionPermission;
    } else if (val && typeof val === 'object') {
      this.currentResource = val.resource;
      this.currentAction = val.action || 'view';
    }
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RbacService
  ) {}

  ngOnInit(): void {
    this.sub = this.rbacService.currentUserRole$.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private updateView(): void {
    if (!this.currentResource) {
      this.clearView();
      return;
    }

    const isAllowed = this.rbacService.hasPermission(this.currentResource, this.currentAction);

    if (isAllowed && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isAllowed && this.hasView) {
      this.clearView();
    }
  }

  private clearView(): void {
    this.viewContainer.clear();
    this.hasView = false;
  }
}
