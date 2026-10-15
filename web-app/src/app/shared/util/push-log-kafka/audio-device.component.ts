import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import {LogKafkaService} from "@shared/util/push-log-kafka/log-kafka.service";

export interface AudioDeviceStatus {
    hasMic: boolean;
    hasSpeaker: boolean;
    microphones: AudioDeviceInfo[];
    speakers: AudioDeviceInfo[];
}

export interface AudioDeviceInfo {
    deviceId: string;
    label: string;
    isWorking?: boolean;
}

@Component({
    selector: 'app-audio-device',
    template: ''
})
export class AudioDeviceComponent implements OnInit, OnDestroy {
    userChannel: any
    @Output() checkDone = new EventEmitter<AudioDeviceStatus>();

    private destroy$     = new Subject<void>();
    private checkSubject = new Subject<void>();
    constructor(
        private logKafkaService: LogKafkaService
    ) {}

    ngOnInit() {
        this.checkSubject.pipe(
            debounceTime(300),
            takeUntil(this.destroy$)
        ).subscribe(async () => {
            const result = await this.checkAudioDevices();
            this.checkDone.emit(result);
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Gọi hàm này từ component khác để trigger check
    check(userChannel: any) {
        this.userChannel = userChannel
        this.checkSubject.next();
    }

    async checkAudioDevices(): Promise<AudioDeviceStatus> {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();

            const microphones = devices.filter(device => device.kind === 'audioinput');
            const speakers    = devices.filter(device => device.kind === 'audiooutput');

            // Lọc bỏ entry ảo default và communications, chỉ lấy thiết bị vật lý thực
            const physicalMicrophones = microphones.filter(d => d.deviceId !== 'default' && d.deviceId !== 'communications');
            const physicalSpeakers    = speakers.filter(d => d.deviceId !== 'default' && d.deviceId !== 'communications');

            const micResults: AudioDeviceInfo[]     = [];
            const speakerResults: AudioDeviceInfo[] = [];

            // Check từng mic có hoạt động không
            if (physicalMicrophones.length > 0) {
                console.log('=== MICROPHONES ===');
                for (const mic of physicalMicrophones) {
                    const micInfo: AudioDeviceInfo = {
                        deviceId : mic.deviceId,
                        label    : mic.label || mic.deviceId,
                        isWorking: false
                    };

                    try {
                        const stream   = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: mic.deviceId } } });
                        const micTrack = stream.getAudioTracks()[0];
                        micInfo.isWorking = micTrack.readyState === 'live';
                        stream.getTracks().forEach(track => track.stop());
                    } catch (e) {
                        micInfo.isWorking = false;
                        console.warn(`Mic [${micInfo.label}] không hoạt động:`, e);
                    }

                    console.log(`Mic [${micInfo.label}] hoạt động:`, micInfo.isWorking);
                    micResults.push(micInfo);
                }
            }

            // Loa chỉ check kết nối, không check hoạt động được qua API
            if (physicalSpeakers.length > 0) {
                console.log('=== SPEAKERS ===');
                physicalSpeakers.forEach(speaker => {
                    const speakerInfo: AudioDeviceInfo = {
                        deviceId: speaker.deviceId,
                        label   : speaker.label || speaker.deviceId,
                    };
                    console.log(`Loa: ${speakerInfo.label}`);
                    speakerResults.push(speakerInfo);
                });
            }

            const result: AudioDeviceStatus = {
                hasMic      : physicalMicrophones.length > 0,
                hasSpeaker  : physicalSpeakers.length > 0,
                microphones : micResults,
                speakers    : speakerResults,
            };

            this.logKafkaService.pushLogKafka(
                this.userChannel?.callId,
                this.userChannel?.callerIdNumber,
                this.userChannel?.calleeIdNumber,
                "AUDIO_DEVICE_CHECKER",
                JSON.stringify(result)
            )
            return result;

        } catch (err) {
            console.error('Không thể truy cập thiết bị âm thanh:', err);
            return {
                hasMic     : false,
                hasSpeaker : false,
                microphones: [],
                speakers   : [],
            };
        }
    }
}
