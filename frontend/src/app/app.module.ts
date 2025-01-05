import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { WebsocketService } from './web-socket.service';
//import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { LoginComponent } from './login/login.component';
//import { NetworkAnalysisComponent } from './network-analysis/network-analysis.component';
//import { NetworkAnaysisService } from './network-analysis';
//import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { NetworkAnaysisService } from './network-anaysis.service';
import { NetworkAnalysisComponent } from './network-analysis/network-analysis.component';
import { TableModule } from 'primeng/table';  // Import TableModule
//import { SortIconModule } from 'primeng/sort'; // Import the SortIconModule
import { DialogModule } from 'primeng/dialog';
import { MetricsComponent } from './metrics/metrics.component';
import { ChartModule } from 'primeng/chart';
import { KeyloggerComponent } from './keylogger/keylogger.component';
import { KeyloggerService } from './keylogger.service';
//import { AuthService } from './auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { AuthService } from './auth.service';
// const config: SocketIoConfig = { url: 'ws://172.23.151.193:8081/ws', options: {} };

@NgModule({
  declarations: [
    AppComponent,  LoginComponent,NetworkAnalysisComponent,MetricsComponent, KeyloggerComponent
  ],
  imports: [
    BrowserModule,CommonModule,FormsModule,HttpClientModule,TableModule,DialogModule,ChartModule,BrowserAnimationsModule , 
    AppRoutingModule,//
    // SocketIoModule.forRoot(config)
  ],
  providers: [NetworkAnaysisService,KeyloggerService,AuthService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add this line
  bootstrap: [AppComponent]
})
export class AppModule { }
