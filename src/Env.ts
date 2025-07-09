
export class Env {

    /**
     * 
     */
    readonly vars: EnvVars = {
        "token": "",
        "replyMsgText": [],
        "channelChatId": 0
    };
    
    /**
     * 
     */
    public constructor(env: any) {
        const {BOT_TOKEN} = env;
        const BOT_CHANNEL_CHAT_ID = Number.parseInt(env.BOT_CHANNEL_CHAT_ID as string, 10);
        const replyMsgTextArray: string[] = [];
        
        let msgText: string | undefined = "";
        let index = 0;
        while (!!(msgText = env["BOT_REPLY_MSG_TEXT_" + index])) {
            replyMsgTextArray.push(msgText)
            index+=1;
        }

        this.vars["token"] = BOT_TOKEN;
        this.vars["replyMsgText"] = replyMsgTextArray;
        this.vars["channelChatId"] = BOT_CHANNEL_CHAT_ID;
        
        console.log("token: " + this.vars["token"] );
        console.log("replyMsgText: " + this.vars["replyMsgText"]);
        console.log("channelChatId: " + this.vars["channelChatId"]);
    }

    /**
     * 
     * @param key
     */
    public getVal<K extends keyof EnvVars>(key: K): EnvVars[K] {
        return this.vars[key];
    }
}

export interface EnvVars {
    "token": string,
    "replyMsgText": string[],
    "channelChatId": number
}