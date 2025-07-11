import {config} from "dotenv";
import {ChannelMessage, TgBotApi} from "./TgBotApi.js";
import nodeCron from "node-cron";
import {Env} from "./Env.js";
config();

start(new Env(process.env));

async function start(env: Env) {
    try {
        const token = env.getVal("token");
        const channelChatId = env.getVal("channelChatId");
        const replyMsgText = env.getVal("replyMsgText");
        
        const api = new TgBotApi(token, channelChatId);

        const runStep = async () => {
            const lastMessageId = await api.loadMessageId();
            await run(api, lastMessageId, replyMsgText);
        }

        await runStep();
        nodeCron.schedule("0 * * * * *", async ()=> await runStep());
    } catch (e) {
        console.error(e);
    }
}

async function run(api: TgBotApi, lastMessageId: number | null, replyMsgText: string[]) {
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

    const randomIndex = Math.floor(Math.random() * replyMsgText.length);
    const replyText = replyMsgText[randomIndex];
    lastMessageId = messageId;
    
    const replyResult = await api.replyToMessage(messageId, replyText);

    if (replyResult.errCode) {
        console.error(`code: ${replyResult.errCode}, ${replyResult.description}`)
        return;
    }

    console.log(`replying to ${text.substring(0, 16)}... (message_id: ${lastMessageId})`);
    await api.saveMessageId(lastMessageId);
}

