import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'ageCalculation'
})

export class AgeCalculation implements PipeTransform{
    transform(value: any): any {
        let nowYear = new Date().getUTCFullYear();
        let pointInTine = new Date(value).getUTCFullYear();
        return nowYear - pointInTine;
    }

}
