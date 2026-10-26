export class EmotionModel {
    stickerId: string;
    groupId: string;
    stickerName: string;
    sourceUrl: string;
    type: number;


    constructor(stickerId: string, groupId: string, stickerName: string, sourceUrl: string, type: number) {
        this.stickerId = stickerId;
        this.groupId = groupId;
        this.stickerName = stickerName;
        this.sourceUrl = sourceUrl;
        this.type = type;
    }
}
