
export class Post {
    constructor(public id: number = -1,
                public username: string = "",
                public contents: any = {text: ""},
                public type: string = "text",
                public response_to: number = 0,
                public likes: number = 0,
                public timestamp: number = -1) { }
}