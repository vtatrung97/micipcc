import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

// Pages Routing
import {PagesRoutingModule} from "./pages-routing.module";
import {SharedModule} from "@shared/shared.module";
@NgModule({
    declarations: [

    ],
    imports: [
        CommonModule,
        FormsModule,
        PagesRoutingModule,
        SharedModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule {

}
