import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})

/**
 * Bread Crumbs Component
 */
export class BreadcrumbsComponent implements OnInit {

  @Input() title?: string;
  @Input() backLink?: string;
  @Input() showLargeTitle?: boolean = false;
  @Input()
  breadcrumbItems!: Array<{
    active?: boolean;
    label?: string;
    link?: string;
  }>;

  Item!: Array<{
    label?: string;
  }>;

  activeItemIndex?: number


  constructor(private router: Router) { }

  ngOnInit(): void {
    // this.activeItemIndex = this.breadcrumbItems.findIndex((item) => item.active)
  }

  routeToBreadCrumb(link?: string) {
    if (link) {
      this.router.navigate([link]);
    }
  }

}
