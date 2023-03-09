import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordComponent } from './components/record/record.component';
import { RecorderRoutingModule } from './recorder.routing.module';
import { AudioService } from './services/audio.service';
import { WebsocketService } from './services/websocket.service';



@NgModule({
  providers:[AudioService,WebsocketService],
  declarations: [
    RecordComponent
  ],
  imports: [
    CommonModule,
    RecorderRoutingModule,
  ]
})
export class RecorderModule { }
