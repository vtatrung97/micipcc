import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {Observable} from "rxjs";
import {ResponseEnvelope} from "@core/models/response.model";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SERVICES} from "@env/environment";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {EmotionGroup} from "@core/models/ticket/emotion-group";
import {EmotionModel} from "@core/models/ticket/emotionModel";

@Injectable({providedIn: 'root'})
export class EmotionService extends AbstractService {
    get SERVICE_URL(): string {
        return `${SERVICES.TICKET_SERVICE_API.url}/api/v1`;
    }

    categories: EmotionGroup[];
    stickerMapByGroupName: Map<string, EmotionModel[]>

    listGifs: EmotionModel[];

    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
        this.categories = []
        this.stickerMapByGroupName = new Map<string, EmotionModel[]>()
        this.listGifs = []
    }

    public getThumbNailsAndFirstGroup(type: string): Observable<ResponseEnvelope<any>> {
        let param = new HttpParams();
        param = this.buildHttpParams(param, "type", type)
        return this.getRequest(this.SERVICE_URL + '/emotions', {params: param})
    }

    isStickerLoaded(){
        return this.categories && this.categories.length > 0
    }

    loadStickerByGroupIdAndType(category: string, type: string) {
        let param = new HttpParams();
        param = this.buildHttpParams(param, "type", type)
        return this.getRequest(`${this.SERVICE_URL}/emotions/${category}`, {params: param})
    }

    loadGifsBySize(size: number, type: string): Observable<ResponseEnvelope<any>>{
        let params = new HttpParams()
        params = this.buildHttpParams(params, "type", type)
        params = this.buildHttpParams(params, "currentSize", size)
        return this.getRequest(`${this.SERVICE_URL}/gifs`, {params: params})
    }

    isGifLoaded() {
        return this.listGifs.length > 0;
    }
}
