import { Injectable } from '@angular/core';
import { Tokens } from './tokens'
import { User } from './user-structures';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  public isMobile: boolean = false;

  public showSidenav: boolean = false;

  public myUsername!: string;
  public myUser!: User;
  public tokens!: Tokens; 

  constructor() { }
}
