// chuyển string dd-mm-yyyy hh:mm:ss thành Date
export function parseDate(str: string): Date {
    const [datePart, timePart] = str.split(' ');
    const [day, month, year] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
}
