import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Tokens } from './tokens'
import { User } from './user-structures';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  public isMobile: boolean = false;
  public showSideBar: boolean = false;

  public myUsername!: string;
  public myUser!: User;
  public tokens: Tokens; 

  constructor(private http: HttpClient) {
    this.tokens = new Tokens('', '', http);
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
}
