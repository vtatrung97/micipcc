import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-action-library',
  templateUrl: './action-library.component.html',
  styleUrls: ['./action-library.component.scss']
})
export class ActionLibraryComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {}
}
