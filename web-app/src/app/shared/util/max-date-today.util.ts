import { createReturn } from "typescript";

export function getStartToday(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day} 00:00:00`;
}

export function getFullDateWithOffset(
    daysToAdd: number = 0,
    showHour: boolean = false,
  ): string {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return showHour
      ? `${year}-${month}-${day} 23:59:59`
      : `${year}-${month}-${day}`;
  }

export function getFullDateToDay(showHour: boolean = false): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    if (showHour) {
        return `${year}-${month}-${day} 23:59:59`;
    }

    return `${year}-${month}-${day}`;
}
export function getFullDateToDay_Report_FromDate(showHour: boolean = false): string {
    let targetDate = new Date();
    // const currentSeconds = targetDate.getSeconds();
    targetDate.setDate(targetDate.getDate());
    targetDate.setHours(0, 0, 0, 0);
    return targetDate.toISOString();
}
export function getFullDateToDay_new(showHour: boolean = false): string {
    let targetDate = new Date();
    // const currentSeconds = targetDate.getSeconds();
    targetDate.setDate(targetDate.getDate());
    if(showHour){
        targetDate.setHours(23, 59, 59, 59);
    }
    return showHour ? targetDate.toISOString() : targetDate.toISOString().split('T')[0];
}

export function getFullDateToDayForHpc(showHour: boolean = false, now: boolean = false): string {
    let targetDate = new Date();
    const currentSeconds = targetDate.getSeconds();
    targetDate.setDate(now ? targetDate.getDate() : (targetDate.getDate() + 1));
    if(showHour){
        targetDate.setHours(targetDate.getHours(), targetDate.getMinutes(), currentSeconds, 0);
    }
    return showHour ? targetDate.toISOString() : targetDate.toISOString().split('T')[0];
}

const OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7

function nowInVN(): number {
    return Date.now() + OFFSET_MS;
}

export function getStartOfToday(): number {
    const localNow = nowInVN();
    return localNow - (localNow % 86400000) - OFFSET_MS;
}

export function getEndOfToday(): number {
    const localNow = nowInVN();
    return localNow - (localNow % 86400000) + 86400000 - 1 - OFFSET_MS;
}

export function getInitialFromDate() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    return firstDay.getTime();
}

export function getInitialToDate() {
    const now = new Date();
    const endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return endDay.getTime();
}

export function getLastDayOfPreviousMonth(): string {
    // lấy ngày cuối cùng của tháng trước
    const today = new Date();

    // Lấy ngày đầu tiên của tháng hiện tại
    const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Lùi lại 1 ngày để ra ngày cuối cùng của tháng trước
    const lastDayOfPreviousMonth = new Date(firstDayOfCurrentMonth.getTime() - 1);

    const year = lastDayOfPreviousMonth.getFullYear();
    const month = String(lastDayOfPreviousMonth.getMonth() + 1).padStart(2, '0');
    const day = String(lastDayOfPreviousMonth.getDate()).padStart(2, '0');

    return `${year}-${month}-${day} 23:59:59`;
  }

