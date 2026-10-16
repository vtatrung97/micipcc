import {Injectable} from '@angular/core';
import {CryptoService} from './crypto.service';

@Injectable({
    providedIn: 'root',
})
class StorageData {
}

export class StorageService {
    public static data: StorageData;
    private static instanceName = '_AppStorage';
    private static storage = localStorage;

    /**
     * isExprited
     */
    public static isExpired(): boolean {
        return false;
    }

    /**
     * clear
     */
    public static clear(): void {
        this.storage.removeItem(this.instanceName);
    }

    /**
     * storedData
     */
    public static storedData(): StorageData | null {
        const storedData = this.storage.getItem(this.instanceName);
        if (this.isNullOrEmpty(storedData)) {
            return null;
        }
        return CryptoService.decrypt(storedData);
    }

    public static isNullOrEmpty(str: any): boolean {
        return !str || (str + '').trim() === '';
    }

    /**
     * get
     */
    public static get(key: string): any {
        if (this.isExpired()) {
            return null;
        }
        const storedData = this.storedData();
        if (storedData == null) {
            return null;
        }
        // @ts-ignore
        return storedData[key];
    }

    /**
     * get
     */
    public static set(key: string, val: any): any {
        let storedData = this.storedData();
        if (storedData == null) {
            storedData = new StorageData();
        }
        // @ts-ignore
        storedData[key] = val;

        this.storage.setItem(this.instanceName, CryptoService.encrypt(storedData));
    }
}
