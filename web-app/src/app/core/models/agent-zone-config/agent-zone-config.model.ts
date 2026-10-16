
export class AgentZoneConfig {
    agentName?: string;
    zoneId?: string;
}
export class AgentZoneConfigValidationResponse {
    validRecord: AgentZoneConfig[];
    invalidCount: number;
    validCount?: number;
    linkUrl: string;
    linkUrlPublic: string;
    filePath: string;
    fileName: string;
    fileSize: number;
}
