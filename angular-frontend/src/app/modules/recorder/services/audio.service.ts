import { Injectable } from '@angular/core';
import { AudioRecorder } from 'src/app/shared/utility/AudioRecorder';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
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
  constructor() {

  }

  async initializeAudioRecorder() {
    return new Promise(resolve => {
      window.navigator.mediaDevices.getUserMedia(this.audioTrackConstraints).then(mediaDevice => {
        this.mediaRecorder = new AudioRecorder(mediaDevice);
        this.mediaRecorder.addEventListener('dataavailable', (e: any) => {
          console.log(e);
        });
        return resolve(true);
      })
    });

  }

  async startRecording() {
    if (!this.mediaRecorder) {
      await this.initializeAudioRecorder();
    }
    this.mediaRecorder?.start(this.recorderTimeSliceMs, this.maximumOutputBuffer);
  }

  async stopRecording() {
    this.mediaRecorder?.stop();
  }

}
