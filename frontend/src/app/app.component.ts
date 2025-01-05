import { Component } from '@angular/core';
// import { WebsocketService } from './web-socket.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // title = 'frontend';
  // message: string = "";
  // messages: string[] = [];
 // constructor(private websocketService: WebsocketService) { }
  // ngOnInit(): void {
  //   this.getMessage();
  // }
  // getMessage() {
  //   this.websocketService.getMessage().subscribe((msg: string) => {
  //     this.messages.push(msg);
  //   });
  // }
  // sendMessage() {
  //   this.websocketService.sendMessage(this.message);
  //   this.message = '';
  //   this.getMessage();
  // }

  constructor(protected router: Router,protected activatedRoute: ActivatedRoute) {
    this.router.navigate(['login']);
  }
  
}
