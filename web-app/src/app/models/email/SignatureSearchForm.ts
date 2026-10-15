export class EmailSignatureSearchForm{
    signatureName?: string;
    emailAddress?: string;
    updateBy?: string;
    updateTimeRange?: any;
    createBy?: string;
    createTimeRange?: any;
    start?: number

}

export class SignatureSearchForm{
    signatureName?: string;
    emailAddress?: string;
    updateBy?: string;
    isSearchAll?: number
    start?: number
    createTimeRange?: any;
    updateTimeRange?: any;
}