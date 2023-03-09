import { Injectable } from '@angular/core';
import { Manager, Socket } from 'socket.io-client';
import { END_TRANSCRIPTION, RECORD_AUDIO, START_TRANSCRIPTION } from 'src/app/data/constants/websocket-commands';
import { WEB_SOCKET_URL } from 'src/environment/environment';
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  socket?: Socket;
  constructor() {

  }

  startConnection() {
    const socketManager = new Manager(WEB_SOCKET_URL, {
      query: {
          sessionId: 'test',
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
    this.socket.on('connection',()=>{
      this.sendCommand(START_TRANSCRIPTION,'start');
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
