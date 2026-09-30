import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { RbacService, UserRole, UserSession } from '@core/rbac';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser!: UserSession;
  isCurrentPageDefault: boolean = false;
  private sub = new Subscription();

  constructor(
    public rbacService: RbacService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.rbacService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.checkDefaultStatus();
      })
    );

    this.sub.add(
      this.rbacService.customLanding$.subscribe(() => {
        this.checkDefaultStatus();
      })
    );

    this.sub.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(() => {
          this.checkDefaultStatus();
        })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  checkDefaultStatus(): void {
    const url = this.router.url;
    this.isCurrentPageDefault = this.rbacService.isCurrentPageDefault(url);
  }

  toggleSetCurrentPageDefault(): void {
    const url = this.router.url;
    if (this.isCurrentPageDefault) {
      this.rbacService.clearUserCustomLandingPage();
    } else {
      this.rbacService.setUserCustomLandingPage(url);
    }
    this.checkDefaultStatus();
  }

  switchRole(role: UserRole): void {
    this.rbacService.switchRole(role);
  }
}
