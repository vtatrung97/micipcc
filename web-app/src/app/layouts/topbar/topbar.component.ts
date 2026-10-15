import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopBarComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  userName: string = 'Leo Nguyen';
  unreadNotifications: number = 5;
  userStatus: 'online' | 'offline' | 'busy' = 'online';

  constructor() {}

  ngOnInit(): void {}

  onToggle(): void {
    this.toggleCollapse.emit();
  }
}
