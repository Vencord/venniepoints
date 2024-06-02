import { CreateMessageOptions, Message } from "oceanic.js";

export const ZWSP = "\u200B";

export function reply(msg: Message, opts: CreateMessageOptions | string): Promise<Message> {
    if (typeof opts === "string")
        opts = {
            content: opts
        };

    return msg.client.rest.channels.createMessage(msg.channelID, {
        ...opts,
        messageReference: {
            messageID: msg.id,
            channelID: msg.channelID,
            guildID: msg.guildID!
        }
    });
}

export function until(ms: number) {
    return new Date(Date.now() + ms).toISOString();
}

export async function silently<T>(p?: Promise<T>) {
    try {
        return await p;
    } catch { }
}
