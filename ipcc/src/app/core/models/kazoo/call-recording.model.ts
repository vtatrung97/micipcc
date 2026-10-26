import {CallRecordingSource} from './call-recording-source.model';
export class CallRecording {
    any: CallRecordingSource | undefined;
    inbound: CallRecordingSource | undefined;
    outbound: CallRecordingSource | undefined;
}
