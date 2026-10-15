import {QueueParamModel} from "@core/models/queue/queue-management/queue-model";
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

// Tạo form control
export function createControl(formControl: any, fb: FormBuilder) {
    let formControlTemp: FormControl<unknown | null>;
    formControlTemp = fb.control(getValueControl(formControl));
    return formControlTemp
}
export function getValueControl(formControl: any) {
    switch(formControl.vcParamType) {
        case 5:
            return formControl.defaultValue === '1';
        case 23:
            return formControl.defaultValue == '' ? null : formControl.defaultValue;
        case 18:
            return formControl.defaultValue ? [formControl.defaultValue] : null;
        default:
            return formControl.defaultValue
    }
}

// Thêm validator vào form control
export function addValidator(formControlTemp: any, formControl: any) {
    if (formControl.validateExpression) {
        formControlTemp.addValidators(Validators.pattern(new RegExp(formControl.validateExpression)));
    }
    if (formControl.minLength) {
        formControlTemp.addValidators(Validators.minLength(formControl.minLength))
    }
    if (formControl.maxValue) {
        formControlTemp.addValidators(Validators.max(formControl.maxValue))
    }
    if (formControl.minValue) {
        formControlTemp.addValidators(Validators.min(formControl.minValue))
    }
    if (formControl.isRequire) {
        formControlTemp.addValidators(Validators.required)
    }
    if (formControl.maxLength) {
        formControlTemp.addValidators(Validators.maxLength(formControl.maxLength));
    }
    if (formControl.editable !== 1 || formControl.displayable !== 1) {
        formControlTemp.disable();
    }
}

// Format lại data cho formGroup từ giá trị của api get by ID
export function convertDataUpdate(listParam: any[]) {
    const params: any = {}
    listParam.forEach(param => {
        if (param.paramType == 12) {
            if (!params[param.paramCode] || !params[param.paramCode].arrayFormTable || params[param.paramCode].arrayFormTable == '') {
                params[param.paramCode] = {arrayFormTable: []};
            }
                params[param.paramCode].arrayFormTable = [...params[param.paramCode].arrayFormTable, transformData([param])].flat();
        } else {
            params[param.paramCode] = getValueUpdate(param)
        }
    })
    return params
}

// Lấy giá trị từ param
export function getValueUpdate(param: any) {
    if (param.paramType === 5) {
        return param.defaultValue === '1' || param.paramValue === '1'
    } else {
        return param.paramValues ? param.paramValues : (param.paramValue || param.paramValue === 0 ? param.paramValue : '')
    }
}

// Lấy các param theo từng tab
export function getData(queueParamList: any[], tabId: string) {
    return queueParamList ?  queueParamList.filter(e => e.queueTabId === tabId) : [];
}

// Lấy các param theo tab thông tin chung
export function getDataNew(queueParamList: any[]) {
    return queueParamList ? queueParamList.filter(e => e.isCreate == 1 && !e.queueTabId) : [];
}

// Format lại params và chuyển các params con của table vào trong param table
export function buildDataBase(params: any[]) {
    let dataForm: any[] = JSON.parse(JSON.stringify(params.filter(e => !e.vcParamParentId)));
    const listTableParam: any[] = JSON.parse(JSON.stringify(params.filter(e => e.vcParamParentId)));
    dataForm = dataForm.map((data: any) => {
        let tableParams: any[];
        tableParams = listTableParam.filter(child => child.vcParamParentId === data.vcParamId);
        return {...data, tableParams}
    })
    return dataForm;
}

// Lấy các giá trị kiểu array trong param kiểu table
export function convertDataNullAndArray(data: any) {
    return Object.fromEntries(
        Object.entries(data).filter(([key, value]) => Array.isArray(value)))
        ;
}

// Lấy các giá trị không phải kiểu array trong param kiểu table
export function convertDataNullAndString(data: any) {
    return Object.fromEntries(
        Object.entries(data).filter(([key, value]) => !Array.isArray(value) || !value)
            .map(([key, value]) => [key,  formatValueSave(value)])
    );
}

// Lấy các giá trị không phải kiểu array vè không phải kiểu null trong param kiểu table
export function convertDataString(data: any) {
    return Object.fromEntries(
        Object.entries(data).filter(([key, value]) => !Array.isArray(value)).map(([key, value]) => [key,  formatValueSave(value)])
    );
}

// Format lại dữ liệu trước khi lưu
export function formatValueSave(data: any) {
    switch (data) {
        case true:
            return '1'
        case false:
            return '0'
        case undefined:
        case null:
            return null
        default:
            return data + ''
    }
}

// Lấy width của param theo cấu hình
export function getColumnWidth(columnWidth: number) {
    switch(columnWidth) {
        case 1:
            return "col-3";
        case 2:
            return "col-6";
        case 3:
            return "col-9";
        case 4:
            return "col-12";
        default:
            return "col-3";
    }
}

// Lấy width của table theo cấu hình
export function getColumnWidthTable(columnWidth: number) {
    return 'width-' + columnWidth
}

// Hàm đệ quy update lại value and validation của từng control trong Form
export function updateFormValidations(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup.controls).forEach(field => {
        const control = formGroup.get(field);
        if (control instanceof FormControl) {
            control.updateValueAndValidity({emitEvent: false});
        } else if (control instanceof FormGroup || control instanceof FormArray) {
            control.updateValueAndValidity({emitEvent: false});
            updateFormValidations(control);
        }
    });
}

// Hàm so sánh giá trị A có phải tất cả thuộc B không (Phục vụ chuyển tab hiện confirm)
export function isEqual(value1: any, value2: any) {
    if ((value1 === null || value1 === undefined || value1 === '') &&
        (value2 === null || value2 === undefined || value2 === '')) {
        return true;
    }
    if (Array.isArray(value1) && Array.isArray(value2)) {
        return arraysEqual(value1, value2);
    }
    if (typeof value1 === 'object' && value1 !== null &&
        typeof value2 === 'object' && value2 !== null) {
        return isObjectSubset(value1, value2);
    }
    return value1 === value2;
}

// Hàm kiểm tra mảng giống nhau
export function arraysEqual(array1: any, array2: any) {
    for (let i = 0; i < array1.length; i++) {
        const found = array2.some((element: any) => isEqual(array1[i], element));
        if (!found) {
            return false;
        }
    }
    return true;
}

// Hàm kiểm tra object giống nhau
export function isObjectSubset(A: any, B: any) {
    for (let key in A) {
        if (A.hasOwnProperty(key)) {
            if (!B.hasOwnProperty(key) || !isEqual(A[key], B[key])) {
                return false;
            }
        }
    }
    return true;
}

// Lấy dự liệu cho form từ dữ liệu api get one
export function transformData(data: any) {
    const specialvcParamTypes = [4, 16, 11, 14, 18, 27, 25];
    return data.map((item: any) => {
        const loadParamValues: any = {};
        item.paramCodes.forEach((vcParamCode: any, index: number) => {
            const vcParamType = item.paramTypes[index];
            let value = item.singleValues[vcParamCode] || item.multiValues[vcParamCode];
            if (specialvcParamTypes.includes(vcParamType)) {
                if (!Array.isArray(value)) {
                    value = value !== undefined ? [value] : null;
                }
            } else {
                if (Array.isArray(value)) {
                    value = value.length > 0 ? value[0] : null;
                }
            }
            if (vcParamType == 5) {
                value = value == 1
            }
            loadParamValues[vcParamCode] = value !== undefined ? value : null;
        });
        return { loadParamValues };
    });
}

// Hàm deep clone 1 control
export function cloneAbstractControl<T extends AbstractControl>(control: T): T {
    let newControl: any;

    if (control instanceof FormGroup) {
        const formGroup = new FormGroup({}, control.validator, control.asyncValidator);
        const controls = control.controls;

        Object.keys(controls).forEach(key => {
            formGroup.addControl(key, cloneAbstractControl(controls[key]));
        })

        newControl = formGroup as any;
    }
    else if (control instanceof FormControl) {
        newControl = new FormControl(control.value, control.validator, control.asyncValidator) as any;
    }
    else {
        throw new Error('Error: unexpected control value');
    }

    if (control.disabled) newControl.disable({emitEvent: false});

    return newControl;
}

export enum ParamConditionType {
    DISABLE = 3,
    HIDE_SHOW_DEPENDENCY = 4
}
