import {config} from "dotenv";
import {ChannelMessage, TgBotApi} from "./TgBotApi.js";
import nodeCron from "node-cron";
config();

const {BOT_TOKEN} = process.env;

const replyMsgTextArray: string[] =[];
let msgText: string | undefined = "";
let index = 0;
while (!!(msgText = process.env["BOT_REPLY_MSG_TEXT_" + index])) {
    replyMsgTextArray.push(msgText)
    index+=1;
}


const BOT_CHANNEL_CHAT_ID = Number.parseInt(process.env.BOT_CHANNEL_CHAT_ID as string, 10);

async function run(api: TgBotApi, lastMessageId: number | null) {
    const response = await api.getLastChannelMessage();
    
    if (response.errCode) {
        console.error(`code: ${response.errCode}, ${response.description}`);
        return;
    }

    const message = response.result as ChannelMessage;
    const {messageId, text} = message;

    if (lastMessageId === messageId) {
        await api.saveMessageId(lastMessageId);
        return;
    }

    const randomIndex = Math.floor(Math.random() * replyMsgTextArray.length);
    const replyText = replyMsgTextArray[randomIndex];
    lastMessageId = messageId;
    
    const replyResult = await api.replyToMessage(messageId, replyText);
    
    if (replyResult.errCode) {
        console.error(`code: ${replyResult.errCode}, ${replyResult.description}`)
        return;
    }
    
    console.log(`replying to ${text.substring(0, 16)}... (message_id: ${lastMessageId})`);
    await api.saveMessageId(lastMessageId);
}


async function start() {
    try {
        if (!BOT_TOKEN || !BOT_CHANNEL_CHAT_ID) { return; }
        const api = new TgBotApi(BOT_TOKEN, BOT_CHANNEL_CHAT_ID);

        const lastMessageId = await api.loadMessageId();
        await run(api, lastMessageId);
        
        nodeCron.schedule("0 * * * * *", async ()=> {
            const lastMessageId = await api.loadMessageId();
            await run(api, lastMessageId);
        });
    } catch (e) {
        console.error(e);
    }
}

start();