import {Injectable} from '@angular/core';
// @ts-ignore
import * as CryptoJS from 'crypto-js';


@Injectable({
    providedIn: 'root'
})
export class CryptoService {
    private static secretKey = 'rNZSYvtgfyUPx75Okf6ArEx2SiktAW9j';

    public static encrypt(data: any) {
        try {
            return CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
        } catch (e) {
            // console.log(e);
        }
    }

    public static decrypt(data: any) {
        try {
            const bytes = CryptoJS.AES.decrypt(data, this.secretKey);
            if (bytes) {
                return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            }
            return data;
        } catch (e) {
            // console.log(e);
        }
    }
}
