export class VtsFileDetail {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileBlob?: Blob;
  fileNameExtension: string;
  currentSizeUploaded: number = 0;
  stateUpload: StateUpload = StateUpload.PreUpload;
}

export enum StateUpload {
  PreUpload = 0,
  Uploading,
  PauseUpload,
  Uploaded
}
