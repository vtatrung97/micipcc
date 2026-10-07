import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioComponent } from './radio.component';
import { RadioExtraDirective, RadioGroupComponent } from './radio-group.component';

@NgModule({
  declarations: [RadioComponent, RadioGroupComponent, RadioExtraDirective],
  imports: [CommonModule],
  exports: [RadioComponent, RadioGroupComponent, RadioExtraDirective]
})
export class RadioModule {}
