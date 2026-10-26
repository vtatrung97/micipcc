export class EmotionGroup {
    groupId: string
    groupName: string
    thumb: string
    type: number;


    constructor(groupId: string, groupName: string, thumb: string, type: number) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.thumb = thumb;
        this.type = type;
    }
}
