import { Injectable } from "@angular/core";
import * as moment from "moment/moment";

@Injectable({
    providedIn: 'root'
})

export class DateService {
    constructor() { }

    unixToDatetime(unix_timestamp: number): string {
        if (!unix_timestamp) return '';
        let a = new Date(unix_timestamp!);
        let year = a.getFullYear();
        let month = a.getMonth() + 1;
        let monthStr = month < 10 ? '0' + month : month;
        let date = a.getDate();
        let dateStr = date < 10 ? '0' + date : date;
        let hour = a.getHours();
        let hourStr = hour < 10 ? '0' + hour : hour;
        let min = a.getMinutes();
        let minStr = min < 10 ? '0' + min : min;
        let sec = a.getSeconds();
        let secStr = sec < 10 ? '0' + sec : sec;
        return `${dateStr}/${monthStr}/${year}<br>${hourStr}:${minStr}:${secStr}`;
    }

    getTomorrow() {
        return moment().add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
    }

    getToday() {
        return moment().format('YYYY-MM-DD');
    }

    difBetweenTwoDays(fromDate: Date, toDate: Date) {
        let dateStart = new Date(fromDate);
        let dateEnd = new Date(toDate);
        let diffDays = moment(dateEnd).diff(moment(dateStart), 'days', true);

        return diffDays;
    }
}
