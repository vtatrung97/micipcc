export interface TicketBccsInfo {
    ticketId?: string;
    requestTime?: number;
    /** Số điện thoại/tài khoản phản ánh */
    bccsIsdn?: string;
    /** Số điện thoại gọi lên */
    isdnRequest?: string;
    /** Số điện thoại liên hệ */
    customerContact?: string;
}
