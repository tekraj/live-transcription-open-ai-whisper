import { ITranscriptionSegment } from "./transcription-segment";

export interface ITranscription {
    language: string;
    segments: ITranscriptionSegment[];
    text: string;
}