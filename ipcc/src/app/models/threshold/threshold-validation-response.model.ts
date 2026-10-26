import {Threshold} from "@models/threshold/threshold.model";

export class ThresholdValidationResponse {
  validThresholds: Threshold[];
  invalidCount: number;
  linkUrl: string;
  linkUrlPublic: string;
  filePath: string;
  fileName: string;
  fileSize: number;
}