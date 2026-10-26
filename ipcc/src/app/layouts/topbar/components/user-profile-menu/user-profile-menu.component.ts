import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-user-profile-menu',
  templateUrl: './user-profile-menu.component.html',
  styleUrls: ['./user-profile-menu.component.scss']
})
export class UserProfileMenuComponent implements OnInit {
  userName: string = '';
  displayName: string = '';
  email: string = '';
  roleName: string = '';
  tenant: string = '';
  deptId: string = '';
  userId: string = '';
  initials: string = '';
  avatarUrl: string = '';
  showProfileModal: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    try {
      const claims = this.authService.claims || {};
      this.userName = claims['preferred_username'] || this.authService.username || 'User';
      this.displayName = claims['name'] || this.userName;
      this.email = claims['email'] || '';
      this.tenant = this.authService.tenant || claims['tenant'] || '';
      this.deptId = claims['deptId'] || this.authService.deptId || '';
      this.userId = this.authService.userId || claims['sub'] || '';
      this.avatarUrl = claims['picture'] || claims['avatar'] || '';

      const roles = this.authService.rolesV2 || this.authService.roles || [];
      if (Array.isArray(roles) && roles.length > 0) {
        const primaryRoles = roles.filter(
          r => !r.startsWith('default-roles') && r !== 'offline_access' && r !== 'uma_authorization'
        );
        this.roleName = primaryRoles[0] || roles[0];
      }

      this.initials = this.getInitials(this.displayName);
    } catch (e) {
      this.userName = 'User';
      this.displayName = 'User';
      this.initials = 'U';
    }
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, Math.min(2, name.length)).toUpperCase();
  }

  openProfileModal(): void {
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  onLogout(): void {
    this.authService.logout();
  }
}
