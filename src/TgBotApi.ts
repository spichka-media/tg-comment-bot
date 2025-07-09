import fs from "fs";
import {ReadStream, WriteStream} from "node:fs";
import {makeDeferredPromise} from "./utils.js";

export interface Response<T> {
    result: T | null
    errCode?: string,
    description?: string
}

export interface ChannelMessage {
    messageId: number,
    text: string
}

export class TgBotApi {
    private readonly tgUrl: string;
    
    private readonly chatId: number

    private static readonly fileName: string = "./lastMessageId.txt";
    
    private wStream?: WriteStream;
    
    private rStream?: ReadStream;
    
    constructor(token: string, chat_id: number) {
        this.tgUrl = `https://api.telegram.org/bot${token}`;
        this.chatId = chat_id;
    }

    public async getLastChannelMessage(): Promise<Response<ChannelMessage>> {
        const url = `${this.tgUrl}/getChat?chat_id=${this.chatId}`;
        const {ok, error_code, description, result} = await (await fetch(url)).json();

        if (!ok) {
            return {result: null, errCode: error_code, description};
        }

        const lastPinnedMsg = result["pinned_message"];
        return {result: {messageId: lastPinnedMsg["message_id"], text: lastPinnedMsg["text"]}}
    }
    
    public async replyToMessage(message_id: number, text: string): Promise<Response<boolean>> {
        const queryParams = new URLSearchParams({
            chat_id: this.chatId.toString(10),
            parse_mode: "MarkdownV2",
            text,
            reply_parameters: JSON.stringify({message_id}),
            disable_web_page_preview: "true"
        }).toString();
        
        const url = `${this.tgUrl}/sendMessage?${queryParams}`;
        const {ok, error_code, description} = await (await fetch(url)).json();
        
        return {result: ok, errCode: error_code, description};
    }
    
    public async saveMessageId(message_id: number) {
        this.wStream = fs.createWriteStream(TgBotApi.fileName, {flags: 'w'});
        
        const text =  Buffer.from(""+message_id, 'utf-8');
        this.wStream.write(text, (err)=>{
            if (!err) {return;}
            console.error(err);
            this.wStream?.close();
        });
    }
    
    public async loadMessageId(): Promise<number | null> {
        const defPromise = makeDeferredPromise();
        this.rStream = fs.createReadStream(TgBotApi.fileName,);

        this.rStream.on('readable',async ()=> {
            const data = this.rStream?.read();
            this.rStream?.close();
            const lastMessageId = data ? Number.parseInt(data.toString(), 10) : null;

            defPromise.resolve(lastMessageId);
        })
        
        return defPromise.promise;
    }
}