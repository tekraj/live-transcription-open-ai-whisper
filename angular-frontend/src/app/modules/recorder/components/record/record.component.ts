import { Component, OnDestroy } from '@angular/core';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { AudioRecorder } from 'src/app/shared/utility/AudioRecorder';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss']
})
export class RecordComponent implements OnDestroy {
  constructor(private websocketService: WebsocketService){

  }

  recorderObservable?: Subscription;
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
        this.recorderObservable = fromEvent(this.mediaRecorder,'dataavailable').subscribe((data: any)=>{
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
    this.recorderObservable?.unsubscribe();
    this.websocketService.endConnection();
  }
}
