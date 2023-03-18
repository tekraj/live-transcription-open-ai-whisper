import { Injectable } from '@angular/core';
import { ITranscriptionSegment } from 'src/app/data/interfaces/transcription-segment';

@Injectable({
  providedIn: 'root'
})
export class TranscriptionHandlerService {

  constructor() { }

  handleTranscription(existingTranscription: ITranscriptionSegment[], newTranscriptionSegments: ITranscriptionSegment[]) {
    const filteredNewTranscription = newTranscriptionSegments.filter(transcription => !existingTranscription.find(t => t.text === transcription.text));
   existingTranscription.push(...filteredNewTranscription);
    return existingTranscription;
  }
}
