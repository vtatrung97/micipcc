import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TicketHomeComponent } from './ticket.component';

const routes: Routes = [
  { path: '', component: TicketHomeComponent }
];

@NgModule({
  declarations: [TicketHomeComponent],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class TicketModule {}
