import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//import { HomeComponent } from './home/home.component';
//import { UserComponent } from './network-analysis/network-analysis.component';
import { LoginComponent } from './login/login.component';
import { NetworkAnalysisComponent } from './network-analysis/network-analysis.component';
import { MetricsComponent } from './metrics/metrics.component';
import { KeyloggerComponent } from './keylogger/keylogger.component';
// import { NetworkAnalysisComponent } from './network-analysis/network-analysis.component';
//import { LoginComponent } from './login/login.componentt';

const routes: Routes = [
  { path: '*/', component: LoginComponent },


  { path: 'login', component: LoginComponent },
   { path: 'network', component: NetworkAnalysisComponent },
   { path: 'metrics', component: MetricsComponent },
   { path: 'keylogger', component: KeyloggerComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
