import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'removeVietnameseTones'
})
export class RemoveVietnameseTones implements PipeTransform {
  transform(str?: string | null): string {
    if (!str) return '';
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a"); //NOSONAR
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");            //NOSONAR
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");                        //NOSONAR
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o"); //NOSONAR
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");            //NOSONAR
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");                        //NOSONAR
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A"); //NOSONAR
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");               //NOSONAR
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");                           //NOSONAR
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O"); //NOSONAR
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U"); //NOSONAR
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y"); //NOSONAR
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); //NOSONAR
    // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    str = str.replace(/\u02C6|\u0306|\u031B/g, "");  //NOSONAR
    // Remove extra spaces
    str = str.replace(/ + /g, " ");
    str = str.trim();
    // Remove punctuations
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " "); //NOSONAR
    return str;
  }
}
