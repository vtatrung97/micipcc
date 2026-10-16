import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'secondsToTime'
})
export class SecondsToTimePipe implements PipeTransform {

    transform(duration?:any, format?: any): any {
        const seconds = parseInt('' + ((duration) % 60));
        const minutes = parseInt('' + ((duration / (60)) % 60));
        const hours = parseInt('' + ((duration / (60 * 60)) % 24));

        const hours_ = (hours < 10) ? '0' + hours : hours;
        const minutes_ = (minutes < 10) ? '0' + minutes : minutes;
        const seconds_ = (seconds < 10) ? '0' + seconds : seconds;
        return hours_ + ':' + minutes_ + ':' + seconds_;
    }
}
