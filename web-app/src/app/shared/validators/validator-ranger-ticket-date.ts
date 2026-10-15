import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const ticketDateWithinGradingRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const fromGradingDate = group.get('fromMarkDate')?.value;
    const toGradingDate = group.get('toMarkDate')?.value;
    const fromTicketDate = group.get('fromDate')?.value;
    const toTicketDate = group.get('toDate')?.value;

    if (!fromGradingDate || !toGradingDate) {
        return null; // Không thể kiểm tra nếu thiếu ngày chấm điểm
    }
    const fromGrading = new Date(fromGradingDate);
    const toGrading = new Date(toGradingDate);
    const errors: any = {};
    if (fromTicketDate) {
        const fromTicket = new Date(fromTicketDate);
        if (fromTicket < fromGrading || fromTicket > toGrading) {
            errors.fromTicketDateOutOfRange = true;
        }
    }
    if (toTicketDate) {
        const toTicket = new Date(toTicketDate);
        if (toTicket < fromGrading || toTicket > toGrading) { errors.toTicketDateOutOfRange = true; }
    }

    return Object.keys(errors).length ? errors : null;
};
