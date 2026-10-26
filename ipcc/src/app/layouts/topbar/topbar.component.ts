import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopBarComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  onToggle(): void {
    this.toggleCollapse.emit();
  }
}
