import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Manager, Socket } from 'socket.io-client';
import { END_TRANSCRIPTION, RECORD_AUDIO, SEND_TRANSCRIPTION, START_TRANSCRIPTION } from 'src/app/data/constants/websocket-commands';
import { WEB_SOCKET_URL } from 'src/environment/environment';
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  socket?: Socket;
  private transcriptionsSubject$: Subject<any> = new Subject();
  transcriptionObservable = this.transcriptionsSubject$.asObservable();
  constructor() {

  }

  startConnection() {
    const socketManager = new Manager(WEB_SOCKET_URL, {
      query: {
          clientId: crypto.randomUUID(),
      },
      transports: ['websocket'],
      path: '/audio-transcription',
      timeout: 200000,
    });
    this.socket = socketManager.socket('/audio', {
      auth: {
        // authorization: 'JWT-key',
      },
    });
    this.sendCommand(START_TRANSCRIPTION,'start');
    this.socket.on(SEND_TRANSCRIPTION, (transcriptions) =>{
      this.transcriptionsSubject$.next(transcriptions);
    });
  }
  endConnection() {
    this.sendCommand(END_TRANSCRIPTION,'end');
    setTimeout(()=>{
      this.socket?.disconnect();
    },1000);
  }

  sendCommand(command: string, data: any) {
    this.socket?.emit(command, data);
  }

  sendAudioBuffer(buffer: ArrayBuffer) {
    this.sendCommand(RECORD_AUDIO , buffer);
  }

}
