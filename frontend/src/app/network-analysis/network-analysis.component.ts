import { Component } from '@angular/core';
import { Router } from '@angular/router';
//import { WebsocketService } from '../web-socket.service';
import { NetworkAnaysisService } from '../network-anaysis.service';

@Component({
  selector: 'network',
  templateUrl: './network-analysis.component.html',
  styleUrls: ['./network-analysis.component.css']
})
 export class NetworkAnalysisComponent {
  packet: any = "";
  packets: any[] = [];
  showDialog: boolean = false;
  selectedPacket: any = null;
constructor(private networkAnaysisService:NetworkAnaysisService) { }
  ngOnInit(): void {
    this.getpacketData();
  }
//   // getMessage() {
//   //   this.websocketService.getMessage().subscribe((msg: string) => {
//   //     this.messages.push(msg);
//   //   });
//   // }
//   // sendMessage() {
//   //   this.websocketService.sendMessage(this.message);
//   //   this.message = '';
//   //   this.getMessage();
//   // }
  getpacketData()
  {

    this.networkAnaysisService.getpacketData().subscribe((msg: any) => {
     var rews=msg;
     // this.packets=rews.slice(0,20);
     this.packets=rews;
     debugger;
    });
  }

  onRowSelect(event:any)
  {

  //  this.selectedPacket = event.data; // Get the selected row's data
    this.showDialog = true; // Open the dialog 
  }
  openpopup()
  {
    this.showDialog = true;
  }

}
