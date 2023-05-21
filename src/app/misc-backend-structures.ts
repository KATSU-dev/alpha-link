
export class Post {
    constructor(public id: number = -1,
                public username: string = "",
                public title: string,
                public user_a: string,
                public mon_a: string,
                public tokens_a: number,
                public user_b: string,
                public mon_b: string,
                public tokens_b: number,
                public sugar_loss: string,
                public bg: string,
                public likes: number = 0,
                public timestamp: number = -1,
                public liked?: number,
                public priority?: number) { }
}
