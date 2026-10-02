import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RbacMenuService, RbacService, UserRole } from '@core/rbac';

@Component({
  selector: 'app-forbidden',
  templateUrl: './forbidden.component.html',
  styleUrls: ['./forbidden.component.scss']
})
export class ForbiddenComponent implements OnInit {
  attemptedUrl: string = '';
  requiredResource: string = '';
  userRole: UserRole = 'AGENT';
  message: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public rbacService: RbacMenuService,
    private coreRbacService: RbacService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.attemptedUrl = params['attemptedUrl'] || '/settings/sla-escalation';
      this.requiredResource = params['resource'] || 'Integration / Admin';
      this.userRole = params['role'] || this.rbacService.getCurrentUser().role;
      this.message = params['message'] || 'Bạn không có quyền xem phân hệ này.';
    });
  }

  goBack(): void {
    // Điều hướng về trang mặc định theo vai trò hoặc tùy chọn của user
    const defaultUrl = this.coreRbacService.getDefaultLandingUrl();
    this.router.navigateByUrl(defaultUrl);
  }

  switchToAdmin(): void {
    this.rbacService.switchRole('ADMIN');
    if (this.attemptedUrl && this.attemptedUrl !== '/forbidden') {
      this.router.navigateByUrl(this.attemptedUrl);
    } else {
      this.router.navigate(['/templates/graph']);
    }
  }
}
