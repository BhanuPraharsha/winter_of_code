import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
//import { AuthsService } from '../auth.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {


  title = 'uiapp';
  username: any;
  password: any;
  msg:string="";

  constructor(private authService: AuthService,private router:Router) {

  }

  loginUser() {
    const username = this.username;
    const password = this.password;

    this.authService.login(username, password).subscribe((response:any) => {
        console.log('Login successful', response);
        this.router.navigate(['network']);
      },
      (error) => {
        console.error('Login failed', error);
        this.msg=error.error.detail;
      }
    );
  }
}