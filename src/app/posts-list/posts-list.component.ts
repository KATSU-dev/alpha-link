import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../misc-backend-structures';

@Component({
  selector: 'app-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.css']
})
export class PostsListComponent implements OnInit {
  @Input('list') public list!: Array<Post>;
  constructor() { }

  ngOnInit(): void { }
}
