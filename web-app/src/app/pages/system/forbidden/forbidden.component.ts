import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  templateUrl: './forbidden.component.html',
  styleUrls: ['./forbidden.component.scss']
})
export class ForbiddenComponent implements OnInit {
  attemptedUrl: string = '';
  requiredResource: string = '';
  message: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.attemptedUrl = params['attemptedUrl'] || '/settings/sla-escalation';
      this.requiredResource = params['resource'] || 'Integration / Admin';
      this.message = params['message'] || 'Bạn không có quyền xem phân hệ này.';
    });
  }

  goBack(): void {
    // Điều hướng về trang mặc định theo vai trò hoặc tùy chọn của user
    this.router.navigateByUrl('/');
  }

  switchToAdmin(): void {
    if (this.attemptedUrl && this.attemptedUrl !== '/forbidden') {
      this.router.navigateByUrl(this.attemptedUrl);
    } else {
      this.router.navigate(['/']);
    }
  }
}
