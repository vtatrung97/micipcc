import {NgModule} from "@angular/core";
import {SecondsToTimePipe} from "@shared/util/seconds-to-time.pipe";

@NgModule({
    declarations: [SecondsToTimePipe],
    exports: [SecondsToTimePipe]
})
export class UtilsModule {
    static forRoot() {
        return {
            ngModule: UtilsModule
        }
    }

    static hasLink(text: string): boolean {
        const urlRegex = /((https?:\/\/|www\.)[^\s]+|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}([\/?#][^\s]*)?)/gi;
        return urlRegex.test(text);
    }
}
