import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../misc-backend-structures';

@Component({
  selector: 'app-post-element-small',
  templateUrl: './post-element-small.component.html',
  styleUrls: ['./post-element-small.component.css']
})
export class PostElementSmallComponent implements OnInit {
  @Input('post') public post!: Post;
  constructor() { }

  ngOnInit(): void {
  }

}
