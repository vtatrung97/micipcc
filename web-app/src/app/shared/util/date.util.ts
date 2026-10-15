export function getLocalTodayString(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function startOfLocalDate(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function isAfterLocalToday(date: Date | null | undefined): boolean {
    if (!date || isNaN(date.getTime())) {
        return false;
    }

    return startOfLocalDate(date).getTime() > startOfLocalDate(new Date()).getTime();
}

export function endOfDate(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

export function getTomorrow(): string {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
