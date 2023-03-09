import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path:'',
    redirectTo:'record',
    pathMatch:'full'
  },
  {
    path:'record',
    loadChildren: ()=>import('./modules/recorder/recorder.module').then(m=>m.RecorderModule),
  }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
