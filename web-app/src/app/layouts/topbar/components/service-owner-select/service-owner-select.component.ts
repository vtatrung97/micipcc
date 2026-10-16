import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { AccountService } from '@core/services/auth/account.service';
import { CoreService } from '@core/services/core-service/core-service.service';
import { NotificationEventService } from '@core/services/notification/notification-event.service';

export interface ServiceOwnerGroup {
  id: string;
  name: string;
}

@Component({
  selector: 'app-service-owner-select',
  templateUrl: './service-owner-select.component.html',
  styleUrls: ['./service-owner-select.component.scss']
})
export class ServiceOwnerSelectComponent implements OnInit {
  serviceOwnerList: ServiceOwnerGroup[] = [];
  selectedGroupId: string = '';
  selectedGroupName: string = '';
  isGroupDropdownOpen: boolean = false;

  constructor(
    private authService: AuthService,
    private coreService: CoreService,
    private accountService: AccountService,
    private notificationEventService: NotificationEventService
  ) {}

  ngOnInit(): void {
    this.loadServiceOwners();
  }

  loadServiceOwners(): void {
    // 1. Kiểm tra groups từ token claims của Keycloak nếu có
    const claims = this.authService.claims || {};
    const tokenGroups = claims['groups'] || claims['group'] || [];
    if (Array.isArray(tokenGroups) && tokenGroups.length > 0) {
      const groupsFromToken: ServiceOwnerGroup[] = tokenGroups.map((g: any) => {
        const raw = typeof g === 'string' ? g : (g.name || String(g));
        const cleanName = raw.replace(/^\//, '').trim();
        return {
          id: cleanName.toLowerCase().replace(/\s+/g, '_'),
          name: cleanName
        };
      });
      if (groupsFromToken.length > 0) {
        this.mergeServiceOwners(groupsFromToken);
      }
    }

    // 2. Kiểm tra cache localStorage trước
    const cachedList = localStorage.getItem('listServiceOwner');
    if (cachedList) {
      try {
        const parsed = JSON.parse(cachedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.mergeServiceOwners(parsed);
        }
      } catch (e) {}
    }

    // 3. Gọi API core-service lấy danh sách keycloak groups: GET /api/v1/keycloak-groups
    this.coreService.searchKeycloakGroups({ page: 1, size: 100 }).subscribe({
      next: (res: any) => {
        const content = res?.result?.content || res?.data?.content || res?.data?.items || res?.result || res?.data || [];
        if (Array.isArray(content) && content.length > 0) {
          const coreGroups: ServiceOwnerGroup[] = content.map((g: any) => ({
            id: String(g.id || g.keycloakGroupId || ''),
            name: g.name || g.groupName || ''
          }));
          this.mergeServiceOwners(coreGroups);
        } else if (!this.serviceOwnerList || this.serviceOwnerList.length === 0) {
          this.fallbackLoadAccountService();
        }
      },
      error: () => {
        if (!this.serviceOwnerList || this.serviceOwnerList.length === 0) {
          this.fallbackLoadAccountService();
        }
      }
    });
  }

  private fallbackLoadAccountService(): void {
    this.accountService.getServiceOwner().subscribe({
      next: (res: any) => {
        const list = res?.data || res || [];
        if (Array.isArray(list) && list.length > 0) {
          const apiGroups: ServiceOwnerGroup[] = list.map((g: any) => ({
            id: String(g.id || g.groupId || g.keycloakGroupId || ''),
            name: g.name || g.groupName || g.nameGroup || ''
          }));
          this.mergeServiceOwners(apiGroups);
        } else if (!this.serviceOwnerList || this.serviceOwnerList.length === 0) {
          this.initMockServiceOwners();
        }
      },
      error: () => {
        if (!this.serviceOwnerList || this.serviceOwnerList.length === 0) {
          this.initMockServiceOwners();
        }
      }
    });
  }

  private mergeServiceOwners(newGroups: ServiceOwnerGroup[]): void {
    const map = new Map<string, ServiceOwnerGroup>();
    this.serviceOwnerList.forEach(g => {
      if (g.name) map.set(g.name.toLowerCase().trim(), g);
    });
    newGroups.forEach(g => {
      if (g.name) {
        const key = g.name.toLowerCase().trim();
        if (!map.has(key)) {
          map.set(key, g);
        }
      }
    });
    this.serviceOwnerList = Array.from(map.values());
    localStorage.setItem('listServiceOwner', JSON.stringify(this.serviceOwnerList));
    this.initSelectedServiceOwner();
  }

  private initMockServiceOwners(): void {
    this.serviceOwnerList = [
      { id: 'vts', name: 'VTS' },
      { id: 'ttcskh', name: 'TTCSKH' },
      { id: 'nhandt6_vts', name: 'Chủ dịch vụ nhandt6 vts' },
      { id: 'group_08', name: 'Group 08' },
      { id: 'group_0demo_1', name: 'Group 0demo 1' }
    ];
    this.initSelectedServiceOwner();
  }

  private initSelectedServiceOwner(): void {
    const savedGroupId = localStorage.getItem('selectedServiceOwner');
    const savedGroupName = localStorage.getItem('selectedServiceOwnerName');

    if (savedGroupId && this.serviceOwnerList.some((g: any) => g.id === savedGroupId)) {
      this.selectedGroupId = savedGroupId;
      const found = this.serviceOwnerList.find((g: any) => g.id === savedGroupId);
      this.selectedGroupName = found?.name || savedGroupName || '';
    } else if (this.serviceOwnerList.length > 0) {
      this.selectedGroupId = this.serviceOwnerList[0].id;
      this.selectedGroupName = this.serviceOwnerList[0].name;
      localStorage.setItem('selectedServiceOwner', this.selectedGroupId);
      localStorage.setItem('selectedServiceOwnerName', this.selectedGroupName);
    }
  }

  onSelectServiceOwner(group: ServiceOwnerGroup): void {
    this.selectedGroupId = group.id;
    this.selectedGroupName = group.name;
    localStorage.setItem('selectedServiceOwner', group.id);
    localStorage.setItem('selectedServiceOwnerName', group.name);
    this.isGroupDropdownOpen = false;
    this.notificationEventService.announceSelectServiceOwner(group.id);
  }
}
