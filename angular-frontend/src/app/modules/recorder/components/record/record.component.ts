import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { AudioRecorder } from 'src/app/shared/utility/AudioRecorder';
import { WebsocketService } from '../../services/websocket.service';
import { ITranscriptionSegment } from 'src/app/data/interfaces/transcription-segment';
import { ITranscription } from 'src/app/data/interfaces/transcription';
import { TranscriptionHandlerService } from '../../services/transcription-handler.service';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss']
})
export class RecordComponent implements OnInit, OnDestroy {
  recorderSubscription?: Subscription;
  transcriptionSubscription?: Subscription;
  recordingInProgress = false;
  mediaRecorder?: AudioRecorder;
  recorderTimeSliceMs = 120;
  maximumOutputBuffer = 60000;
  audioTrackConstraints = {
    echoCancellation: { exact: false },
    autoGainControl: { exact: false },
    noiseSuppression: { exact: false },
    sampleRate: 44100,
    audio: true,
  };
  transcriptions: ITranscriptionSegment[] =[];
  constructor(private websocketService: WebsocketService,
    private transcriptionHandlerService: TranscriptionHandlerService
    ){

  }
  ngOnInit(): void {
    this.recorderSubscription = this.websocketService.transcriptionObservable.subscribe((data:ITranscription)=>{
      this.transcriptions = this.transcriptionHandlerService.handleTranscription(this.transcriptions,data.segments);
      console.log(this.transcriptions);
    })
  }
  
  async startRecording(){
    if(this.recordingInProgress){
      return;
    }
    try{
        const stream = await window.navigator.mediaDevices.getUserMedia(this.audioTrackConstraints)
        this.mediaRecorder = new AudioRecorder(stream);
        this.mediaRecorder.start(this.recorderTimeSliceMs,this.maximumOutputBuffer);
        this.websocketService.startConnection();
        this.websocketService.sendCommand('START_AUDIO','start');
        this.recorderSubscription = fromEvent(this.mediaRecorder,'dataavailable').subscribe((data: any)=>{
          this.websocketService.sendAudioBuffer((data.data) as ArrayBuffer);
        });
      this.recordingInProgress = true;
    }catch(e){
      console.log(e);
    }
    
  }
  stopRecording(){
    this.mediaRecorder?.stop();
    this.recordingInProgress = false;
  }

  ngOnDestroy(): void {
    this.recorderSubscription?.unsubscribe();
    this.websocketService.endConnection();
  }
}
