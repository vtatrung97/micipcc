import {TranslateService} from "@ngx-translate/core";
import {Injectable} from "@angular/core";
import * as moment from "moment";

@Injectable({providedIn: 'root'})
export class TimeConverterUtil {
    static UNIX_STARTUP_TIME_BY_SECONDS_SINCE_YEAR_0: number = 62167219200;
    constructor(private translate: TranslateService) {
    }
    static secondsToTime(miliSeconds: number): string {
        let seconds = miliSeconds / 1000;
        let h = Math.floor(seconds / 3600);
        let m = Math.floor(seconds % 3600 / 60);
        let s = Math.floor(seconds % 3600 % 60);
        return ('' + h) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
    }

    static secondsToHHMMSS(seconds: number | string | null): string {
        if (seconds === null) return '00:00:00';
        seconds = +seconds;
        let h = Math.floor(seconds / 3600);
        let m = Math.floor(seconds % 3600 / 60);
        let s = Math.floor(seconds % 3600 % 60);
        return ((h < 10 ? '0' : '') + h) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
    }

    static secondsToMMSS(seconds: number | string | null | undefined): string {
        if (seconds === null || seconds === undefined) return '';
        seconds = +seconds;
        let m = Math.floor(seconds / 60);
        let s = Math.floor(seconds % 60);
        return (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s);
    }

    static getStartOfDayEpoch() {
        let now = moment();
        return now.startOf('day').valueOf();
    }

    static getEndOfDayEpoch() {
        let now = moment();
        return now.endOf('day').valueOf();
    }

    static secondsSinceYear0ToUnix(seconds: number) {
        return seconds - this.UNIX_STARTUP_TIME_BY_SECONDS_SINCE_YEAR_0;
    }

    static secondsSinceYear0ToUnixMs(seconds: number) {
        return 1000 * (seconds - this.UNIX_STARTUP_TIME_BY_SECONDS_SINCE_YEAR_0);
    }

    getRangeTimeToNow(range: number): {from: number, to: number} {
       let now = moment()
        return {
            from: now.startOf('day').valueOf() - range,
            to: now.endOf('day').valueOf()
        }
    }

    roundTime(a: number) {
        if (a < 1) {
            return Math.floor(a);
        } else {
            return Math.round(a);
        }
    }
    secondsToTimeContainsDay(miliSeconds: number): string {

        const seconds = Math.abs(miliSeconds / 1000);
        let y = this.roundTime(seconds / 31536000);
        let mo = this.roundTime((seconds % 31536000) / 2628000);
        let d = this.roundTime(((seconds % 31536000) % 2628000) / 86400);
        let h = this.roundTime((seconds % (3600 * 24)) / 3600);
        let m = this.roundTime((seconds % 3600) / 60);
        let s = this.roundTime(seconds % 60);

        let yDisplay = y > 0 ? y + " " + (y === 1 ? this.translate.instant("common.time-unit.year") : this.translate.instant("common.time-unit.years")) : undefined;
        let moDisplay = mo > 0 ? mo + " " + (mo === 1 ? this.translate.instant("common.time-unit.month") : this.translate.instant("common.time-unit.months")) : undefined;
        let dDisplay = d > 0 ? d + " " + (d === 1 ? this.translate.instant("common.time-unit.day") : this.translate.instant("common.time-unit.days")) : undefined;
        let hDisplay = h > 0 ? h + " " + (h === 1 ? this.translate.instant("common.time-unit.hour") : this.translate.instant("common.time-unit.hours")) : undefined;
        let mDisplay = m > 0 ? m + " " + (m === 1 ? this.translate.instant("common.time-unit.minute") : this.translate.instant("common.time-unit.minutes")) : undefined;
        let sDisplay =  s + " " + (s === 1 ? this.translate.instant("common.time-unit.second") : this.translate.instant("common.time-unit.seconds"));
        return yDisplay ?? moDisplay ?? dDisplay ?? hDisplay ?? mDisplay ?? sDisplay;
    }


    secondsToTimeEnglish(miliSeconds: number): string {
        const seconds = miliSeconds / 1000;
        let y = this.roundTime(seconds / 31536000);
        let mo = this.roundTime((seconds % 31536000) / 2628000);
        let d = this.roundTime(((seconds % 31536000) % 2628000) / 86400);
        let h = this.roundTime((seconds % (3600 * 24)) / 3600);
        let m = this.roundTime((seconds % 3600) / 60);
        let s = this.roundTime(seconds % 60);

        let yDisplay = y > 0 ? y + "y" : undefined;
        let moDisplay = mo > 0 ? mo + "m" : undefined;
        let dDisplay = d > 0 ? d + "d" : undefined;
        let hDisplay = h > 0 ? h + "h" : undefined;
        let mDisplay = m > 0 ? m + "m" : undefined;
        let sDisplay =  s + "s";
        return yDisplay ?? moDisplay ?? dDisplay ?? hDisplay ?? mDisplay ?? sDisplay;
    }

    static unixToDatetime(unix_timestamp: number): string {
        if (!unix_timestamp) return '';
        let a = new Date(unix_timestamp);
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

    static unixToDDMMYYYYHHmmSS(unix_timestamp: string | number | null | undefined): string {
        if (unix_timestamp === null || unix_timestamp === undefined) return ``
        unix_timestamp = +unix_timestamp;
        let a = new Date(unix_timestamp);
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
        return `${dateStr}/${monthStr}/${year} ${hourStr}:${minStr}:${secStr}`;
    }

    static unixToHHmmDDMMYYYY(unix_timestamp: string | number | null, style1: string, style2: string): string {
        if (unix_timestamp === null) return `<div>NaN</div>`
        unix_timestamp = +unix_timestamp;
        let a = new Date(unix_timestamp);
        let year = a.getFullYear();
        let month = a.getMonth() + 1;
        let monthStr = month < 10 ? '0' + month : month;
        let date = a.getDate();
        let dateStr = date < 10 ? '0' + date : date;
        let hour = a.getHours();
        let hourStr = hour < 10 ? '0' + hour : hour;
        let min = a.getMinutes();
        let minStr = min < 10 ? '0' + min : min;
        return `<div class="d-flex flex-column align-items-start"><div style="${style1}">${hourStr}:${minStr}</div><div style="${style2}">${dateStr}/${monthStr}/${year}</div></div>`;
    }
}
