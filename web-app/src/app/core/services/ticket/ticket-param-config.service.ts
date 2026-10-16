import {Injectable} from "@angular/core";
import {KpiConfigParamService} from "@core/services/category/kpi-param/kpi-config-param.service";
import {KpiConfigParamModel} from "@core/models/ticket/kpi-config-param.model";
import {TranslateService} from "@ngx-translate/core";
import {ToastService} from "@core/services/toast-service";
import {PROPERTIES} from "@env/environment";

@Injectable({providedIn: 'root'})
export class TicketParamConfigService {
    private configMap: Map<string, Map<string, KpiConfigParamModel> | null>;
    private currentConfig: Map<string, KpiConfigParamModel> | undefined;
    public ticketSourceId = ''
    public channelId: number

    imgs: string[] = []
    mp3s: string[] = []
    mp4s: string[] = []
    others: string[] = []

    /* zalo, mess, portal, fb-comment */
    imageFormatCode = 'KPI_OUT_UPLOAD_FILE_IMAGE_FORMAT';
    audioFormatCode = 'KPI_OUT_UPLOAD_FILE_AUDIO_FORMAT';
    videoFormatCode = 'KPI_OUT_UPLOAD_FILE_VIDEO_FORMAT';
    otherFormatCode = 'KPI_OUT_UPLOAD_FILE_OTHER_FORMAT';

    imageFileSizeCode = 'KPI_OUT_MAX_IMAGE_UPLOAD_SIZE';
    audioFileSizeCode = 'KPI_OUT_MAX_AUDIO_UPLOAD_SIZE';
    videoFileSizeCode = 'KPI_OUT_MAX_VIDEO_UPLOAD_SIZE';
    otherFileSizeCode = 'KPI_OUT_MAX_OTHER_UPLOAD_SIZE';

    allowSendFileCode = "KPI_OUT_ENABLE_SEND_FILE"
    allowSendEmojiCode = "KPI_OUT_ENABLE_SEND_EMOJI"
    allowSendStickerCode = "KPI_OUT_ENABLE_SEND_STICKER"
    allowSendGifCode = "KPI_OUT_ENABLE_SEND_GIF"

    SOURCE_ID_CODE = "SOURCE_ID"

    constructor(private paramConfigService: KpiConfigParamService, private transSV: TranslateService, private toastSV: ToastService) {
        this.configMap = new Map<string, Map<string, KpiConfigParamModel>>();
        this.currentConfig = new Map<string, KpiConfigParamModel>()
    }

    isAllowSendFile: boolean = false;
    isAllowSendEmoji: boolean = false;
    isAllowSendSticker: boolean = false;
    isAllowSendGif: boolean = false;

    checkAllowSendFile() {
        // @ts-ignore
        let allowSendFileConfig = this.currentConfig[this.allowSendFileCode]
        this.isAllowSendFile = allowSendFileConfig && allowSendFileConfig.value.trim().toUpperCase() == 'ENABLE'
    }

    checkAllowSendSticker() {
        // @ts-ignore
        let allowSendStickerConfig = this.currentConfig[this.allowSendEmojiCode];
        this.isAllowSendEmoji = allowSendStickerConfig && allowSendStickerConfig.value.trim().toUpperCase() == 'ENABLE'
    }

    checkAllowSendEmoji() {
        // @ts-ignore
        let allowSendEmojiConfig = this.currentConfig[this.allowSendStickerCode];
        this.isAllowSendSticker = allowSendEmojiConfig && allowSendEmojiConfig.value.trim().toUpperCase() == 'ENABLE'
    }

    checkAllowSendGif() {
        // @ts-ignore
        let allowSendGifConfig = this.currentConfig[this.allowSendGifCode];
        this.isAllowSendGif = allowSendGifConfig && allowSendGifConfig.value.trim().toUpperCase() == 'ENABLE'
    }

    public publishTicketEvent(sourceId: string, channelId: number, isId: 1 | -1) {
        if (isId == -1) {
            this.loadConfigByTicket(sourceId, channelId, isId);
        } else {
            this.loadConfigByTicket(sourceId, channelId, 1);
            // this.currentConfig = this.getConfigByKey(sourceId)
            // this.loadConfigDetail(this.currentConfig!)
            // this.checkAllowSendFile()
            // this.checkAllowSendSticker()
            // this.checkAllowSendEmoji()
            // this.checkAllowSendGif()
            // if (!this.configMap.has(sourceId)) {
            //     // this.configMap.set(sourceId, null)
            //     this.loadConfigByTicket(sourceId, channelId, 1);
            // } else {
            //     this.currentConfig = this.getConfigByKey(sourceId)
            //     this.loadConfigDetail(this.currentConfig!)
            //     this.checkAllowSendFile()
            //     this.checkAllowSendSticker()
            //     this.checkAllowSendEmoji()
            //     this.checkAllowSendGif()
            // }
            // this.channelId = channelId;
        }
    }

    private loadConfigByTicket(sourceObject: string, channelId: number, isId: number) {
        if (!sourceObject || !channelId) return;
        let kpiParamConfigSubscriber = this.paramConfigService.getKpiParamConfigByChannelIdAndSourceId(channelId, sourceObject, isId);
        kpiParamConfigSubscriber.subscribe(result => {
            if (result && result.status == 'success') {
                // @ts-ignore
                let sourceId = result.data[this.SOURCE_ID_CODE]
                this.configMap.set(sourceId, result.data)
                this.currentConfig = result.data;

                this.loadConfigDetail(this.currentConfig)
                this.checkAllowSendFile()
                this.checkAllowSendSticker()
                this.checkAllowSendEmoji()
                this.checkAllowSendGif()

                this.ticketSourceId = sourceId;
            }
        })
    }

    loadConfigDetail(configMap: Map<string, KpiConfigParamModel>) {
        if (configMap.size == 0) return;
        else {
            // @ts-ignore
            this.imgs = configMap[this.imageFormatCode]?.value?.replaceAll(".", '').replaceAll(" ","").toUpperCase().split(',')
            // @ts-ignore
            this.mp3s = configMap[this.audioFormatCode]?.value?.replaceAll(".", '').replaceAll(" ","").toUpperCase().split(',')
            // @ts-ignore
            this.mp4s = configMap[this.videoFormatCode]?.value?.replaceAll(".", '').replaceAll(" ","").toUpperCase().split(',')
            // @ts-ignore
            this.others = configMap[this.otherFormatCode]?.value?.replaceAll(".", '').replaceAll(" ","").toUpperCase().split(',')
        }
    }

    getConfigByKey(key: string): Map<string, KpiConfigParamModel> {
        // @ts-ignore
        return this.configMap[key];
    }

    deleteByKey(key: string) {
        this.configMap.delete(key);
    }

    getCurrentConfig() {
        return this.currentConfig;
    }

    validateFile(file: File) {
        let filename = file.name;
        let fileSizeCode: string = this.getFileSizeCode(filename);
        let allType = `${this.imgs ? (this.imgs + ',')  : ''} ${this.mp3s ? (this.mp3s + ',')  : ''} ${this.mp4s ? (this.mp4s + ',')  : ''} ${this.others ? this.others : ''}`
        if (fileSizeCode == '') {
            this.toastSV.showDanger(this.transSV.instant('ticket.validate.not-allow-type', {
                'fileName': filename,
                'supportedFormats': allType
            }))
            return false;
        }
        // @ts-ignore
        let fileSizeConfig = this.currentConfig[fileSizeCode];
        let fileSize = file.size;
        let validSize = (fileSizeConfig && fileSizeConfig!.value) ? Number(fileSizeConfig!.value) : PROPERTIES.DEFAULT_FILE_SIZE;
        let filSizInvalid = fileSize > (validSize * (1024 * 1024));
        if (filSizInvalid) {
            this.toastSV.showDanger(this.transSV.instant('ticket.validate.invalid-filesize', {
                'fileName': filename,
                'fileSize': validSize
            }))
            return false;
        }
        return true;
    }

    getFileSizeCode(fileName: string): string {
        let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1).toUpperCase();
        if (this.imgs?.includes(fileExtension)) {
            return this.imageFileSizeCode;
        } else if (this.mp3s?.includes(fileExtension)) {
            return this.audioFileSizeCode;
        } else if (this.mp4s?.includes(fileExtension)) {
            return this.videoFileSizeCode;
        } else if (this.others?.includes(fileExtension)) {
            return this.otherFileSizeCode;
        } else {
            return '';
        }
    }
}
