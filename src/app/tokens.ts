import { HttpClient } from "@angular/common/http";

export class Tokens{
    private iat: number = 0;
    constructor(public access_token: string,
                public refresh_token: string,
                private http: HttpClient) {
                    setInterval(() => this.updateAccessToken(), 1740000); // Auto-refresh access token every 29 mins. TTL is 30 mins.
                }
                
    public setTokens(access_token: string, refresh_token:string) {
        this.access_token = access_token;
        this.refresh_token = refresh_token;
        this.iat = Date.now();
        console.log(this.toJSON());
    }

    public updateAccessToken() {
        console.log("UPDATING TOKENSS");
        console.log(this.http);
        this.http.post("https://www.alphalink.app/aut/user/refresh", {token: this.refresh_token})
            .subscribe({
                next:(data: any) => {
                    this.access_token = data.accessToken;
                    this.iat = Date.now();
                    console.log("NEW TOKEN:", this.access_token);
                },
                error:(error: any) => {
                    console.log(error);
                    console.log("Failed to update access token...");
                }
            });
    }

    public checkTokenValidity() {
        // Post to server to find out if access token is okay
    }

    public tokensPresent() {
        return (this.access_token !== "" && this.refresh_token !== "");
    }

    public clear() {
        this.access_token = "";
        this.refresh_token = "";
    }

    public toJSON() {
        return {access_token: this.access_token, refresh_token: this.refresh_token};
    }

    public toString() {
        return JSON.stringify(this.toJSON());
    }
}

export interface ITokens {
    accessToken: string,
    refreshToken: string,
}
