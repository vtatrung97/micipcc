import { Injectable } from '@angular/core';
import {FormGroup} from "@angular/forms";
import * as moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class ReportCustomFormServiceService {

  constructor() { }



  initFormChangeTimeSubscribe(searchForm:FormGroup, nodeControlName: string, fromControlName: string, toControlName: string ,localControl: {skipFromTime : boolean, skipToTime : boolean, skipTimeChose: boolean} ) {

    searchForm.get(nodeControlName)?.valueChanges.subscribe(value => {
      if(value) {
        this.handleSetTimeInput(searchForm, fromControlName, toControlName, value, localControl)
      }

    })
    searchForm.get(fromControlName)?.valueChanges.subscribe(value => {

      if(localControl.skipFromTime){
        localControl.skipFromTime = false;
        return;
      }
      searchForm.controls[nodeControlName].reset(null, { emitEvent: false });
      localControl.skipTimeChose = true;

    })
    searchForm.get(toControlName)?.valueChanges.subscribe(value => {

      if(localControl.skipToTime){
        localControl.skipToTime = false;
        return;
      }
      searchForm.controls[nodeControlName].reset(null, { emitEvent: false })
      localControl.skipTimeChose = true;
    })


  }

  handleSetTimeInput(searchForm: FormGroup, fromName: string, toName: string, value:number, localControl: {skipFromTime : boolean, skipToTime : boolean, skipTimeChose: boolean}){
    localControl.skipFromTime = true;
    localControl.skipToTime = true;
    const date = new Date();
    switch (value) {
      case 1://Hom nay
        searchForm.patchValue(
            {
              [fromName]:this.getDayRange('start',date),
              [toName]:this.getDayRange('end',date)
            },{ emitEvent: false })
        break;
      case 2://hom qua
        const prevDate = new Date(date.setDate(date.getDate()-1));
        searchForm.patchValue(
            {
              [fromName]:this.getDayRange('start',prevDate),
              [toName]:this.getDayRange('end',prevDate)
            },{ emitEvent: false })
        break;
      case 3://3 ngay gan nhat
        searchForm.patchValue(
            {
              [fromName]:this.getDayRange('start',new Date(date.setDate(date.getDate() -2))),
              [toName]:this.getDayRange('end',new Date())
            },{ emitEvent: false })
        break;
      case 4://7 ngay gan nhat
        searchForm.patchValue(
            {
              [fromName]:this.getDayRange('start',new Date(date.setDate(date.getDate() -6))),
              [toName]:this.getDayRange('end',new Date())
            },{ emitEvent: false })
        break;

      case 5://Tuan nay
        const firstCurrWeek = new Date(date.setDate(date.getDate() - date.getDay() + 1));
        searchForm.patchValue(
            {
              [fromName]:this.getDayRange('start',firstCurrWeek),
              [toName]:this.getDayRange('end',new Date())
            },{ emitEvent: false })
        break;

      case 6://tuan truoc
        const firstLastWeek = new Date(date.setDate(date.getDate() - date.getDay() + 1 - 7));
        searchForm.patchValue(
            {
              [fromName]:this.getDayRange('start',firstLastWeek),
              [toName]:this.getDayRange('end',new Date(firstLastWeek.setDate(firstLastWeek.getDate() + 6)))
            },{ emitEvent: false })
        break;

      case 7://thang nay
        const firstCurrMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        searchForm.patchValue(
            {
              [fromName]:this.getDayRange('start',firstCurrMonth),
              [toName]:this.getDayRange('end',new Date())
            },{ emitEvent: false })
        break;

      case 8://thang truoc
        const firstPrevMonth = new Date(date.getFullYear(), date.getMonth()-1, 1);
        const lastPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
        searchForm.patchValue(
            {
              [fromName]:this.getDayRange('start',firstPrevMonth),
              [toName]:this.getDayRange('end',lastPrevMonth)
            },{ emitEvent: false })
        break;

    }

  }

  getDayRange(type = "both", date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const result = {
      start: {
        date: start,
        timestamp: start.getTime()
      },
      end: {
        date: end,
        timestamp: end.getTime()
      }
    };

    if (type === "start") return result.start.timestamp;
    if (type === "end") return result.end.timestamp;
    return null; // mặc định trả cả 2
  }

  checkRangerOneMonth(requestTimeTo: number, requestTimeFrom: number) {
    const from = moment(requestTimeFrom);
    const to = moment(requestTimeTo);

    // Tính số tháng chênh lệch (có thập phân)
    const diffInMonths = Math.abs(from.diff(to, 'months', true));

    return diffInMonths > 1;
  }
}
