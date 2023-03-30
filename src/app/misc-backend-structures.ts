
export class Post {
    constructor(public id: number = -1,
                public username: string = "",
                public contents: any = {text: ""},
                public likes: number = 0,
                public timestamp: number = -1,
                public title?: string,
                public liked?: number,
                public priority?: number) { }

    public copy() {
        return new Post(this.id, this.username, this.contents,
                        this.likes, this.timestamp, this.title, this.liked, this.priority);
    }
}
