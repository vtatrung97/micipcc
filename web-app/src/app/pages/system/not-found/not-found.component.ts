import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { RbacService } from '@core/rbac';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  attemptedUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private rbacService: RbacService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.attemptedUrl = params['attemptedUrl'] || this.router.url;
      if (this.attemptedUrl === '/not-found') {
        this.attemptedUrl = '';
      }
    });
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.goToLanding();
    }
  }

  goToLanding(): void {
    const defaultUrl = this.rbacService.getDefaultLandingUrl();
    this.router.navigateByUrl(defaultUrl);
  }
}
