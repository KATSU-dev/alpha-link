import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../misc-backend-structures';

@Component({
  selector: 'app-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.css']
})
export class PostsListComponent implements OnInit {
  @Input('list') public list!: Array<Post>;
  // public left_list: Array<Post> = [];
  // public right_list: Array<Post> = [];
  // private loopRef: any;
  constructor() { }

  ngOnInit(): void {
    // this.loopRef = setInterval(() => {
    //   if(!this.list.length) return;

    //   clearInterval(this.loopRef);
    //   console.log("LIST", this.list);
    //   this.list.forEach((post: Post) => {
    //     if(post.id%2 == 0) this.right_list.push(post);
    //     else this.left_list.push(post);
    //   });

    // }, 250);
  }

}
