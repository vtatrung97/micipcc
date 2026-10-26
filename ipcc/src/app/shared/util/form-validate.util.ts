import {AbstractControl, AsyncValidator, ValidationErrors, ValidatorFn} from "@angular/forms";
import * as dayjs from 'dayjs';
import {Injectable} from "@angular/core";
import {AutoblockRuleService} from "@core/services/ticket/autoblock-rule.service";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";

export const EMOJI_ONLY_TEXT_REGEX = /^[\p{Extended_Pictographic}\s]+$/u;

export const COMMON_CONFIG = {
    // NUMBER: /^(?:-(?:[1-9](?:\d{0,2}(?:,\d{3})+|\d*))|(?:0|(?:[1-9](?:\d{0,2}(?:,\d{3})+|\d*))))(?:.\d+|)$/,
    PHONE_VN_REGEX: /^(84|0)[35789]([0-9]{8})$/ ,
    ZALO_CALL_PREFIX: "zalo_"
}

export function onlyNumberValidator(): ValidatorFn {
    return (control:AbstractControl): ValidationErrors | null => {
        return !/^-?[\d.]+(?:e-?\d+)?$/.test(control.value) ? { onlyNumber: true } : null;
    }
}

/**
    validate date range có trong giới hạn khoảng thời gian cho phép
 */
export function maxDateRangeValidator(range: number): ValidatorFn {
    return (control:AbstractControl): ValidationErrors | null => {
        if (!control.value.from || !control.value.to) {
            return null
        }
        let from = dayjs(control.value.from);
        let to = dayjs(control.value.to);
        let days = to.diff(from, 'days') + 1;
        return days > range ? { maxDateRangeValidator: true } : null;
    };
}

/**
 validate date range có trong giới hạn khoảng thời gian cho phép
 */
export function dateZaloValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {

        const value = control.value;

        if (!value) {
            return null;
        }

        const regexTime = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
        const regexDate = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[012])\/\d{4}$/
        const regexDateAndTime = /^([01][0-9]|2[0-3]):([0-5][0-9]) (0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[012])\/\d{4}$/
        const timeValid = value.match(regexTime) || value.match(regexDate) || value.match(regexDateAndTime);

        return !timeValid ? {dateZalo:true}: null;
    }
}

/* Validate date range required */
export function dateRangeRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value || !value.from || !value.to) {
        return { required: true };
    }
    return null;
}

export class UniqueRuleNameValidator implements AsyncValidator {
     initialRuleName : string;
     blockRuleSvc: AutoblockRuleService;
    constructor(blockRuleSvc: AutoblockRuleService, initialRuleName: string = "") {
        this.initialRuleName = initialRuleName
        this.blockRuleSvc = blockRuleSvc;
    }

    validate(
        control: AbstractControl
    ): Observable<ValidationErrors | null> {
        if (this.initialRuleName == control.value) return  of(null);
        return this.blockRuleSvc.checkExistRuleName(control.value, localStorage.getItem('selectedServiceOwner')).pipe(
            map(res => (res.data ? { uniqueName: true } : null)),
            catchError(() => of(null))
        );
    }
}
