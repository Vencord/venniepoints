import { ActivityTypes, AnyTextableChannel, Client, Message } from "oceanic.js";

import { Commands } from "./Command";
import { PREFIX } from "./constants";
import { reply, silently } from "./util";

export const Vennie = new Client({
    auth: "Bot " + process.env.DISCORD_TOKEN,
    gateway: { intents: ["ALL"] },
    allowedMentions: {
        everyone: false,
        repliedUser: false,
        roles: false,
        users: false
    }
});

export let OwnerId: string;
Vennie.once("ready", async () => {
    Vennie.rest.oauth.getApplication().then(app => {
        OwnerId = app.ownerID;
    });

    console.log("hi");
    console.log(`Connected as ${Vennie.user.tag} (${Vennie.user.id})`);
    console.log(`I am in ${Vennie.guilds.size} guilds`);
    console.log(`https://discord.com/oauth2/authorize?client_id=${Vennie.user.id}&permissions=8&scope=bot+applications.commands`);

    Vennie.editStatus("online", [
        {
            name: "custom",
            state: `${PREFIX}help`,
            type: ActivityTypes.CUSTOM
        }
    ]);
});

const whitespaceRe = /\s+/;

Vennie.on("messageCreate", async msg => {
    if (!msg.inCachedGuildChannel()) return;
    if (msg.author.bot) return;

    if (!msg.content?.toLowerCase().startsWith(PREFIX)) return;

    const content = msg.content.slice(PREFIX.length).trim();
    const args = content.split(whitespaceRe);

    const cmdName = args.shift()?.toLowerCase()!;
    const cmd = Commands[cmdName];
    if (!cmd) return;

    if (cmd.ownerOnly && msg.author.id !== OwnerId)
        return;

    if (cmd.guildOnly && msg.inDirectMessageChannel())
        return reply(msg, { content: "This command can only be used in servers" });

    if (cmd.permissions) {
        if (!msg.inCachedGuildChannel()) return;

        const memberPerms = msg.channel.permissionsOf(msg.member);
        if (cmd.permissions.some(perm => !memberPerms.has(perm)))
            return;
    }

    const noRateLimit = msg.member?.permissions.has("MANAGE_MESSAGES");

    if (!noRateLimit) {
        if (cmd.rateLimits.has(msg.author.id))
            return;

        cmd.rateLimits.add(msg.author.id);
        setTimeout(() => cmd.rateLimits.delete(msg.author.id), 10_000);
    }

    if (!msg.channel)
        await msg.client.rest.channels.get(msg.channelID);

    try {
        if (cmd.rawContent)
            await cmd.execute(msg as Message<AnyTextableChannel>, content.slice(cmdName.length).trim());
        else
            await cmd.execute(msg as Message<AnyTextableChannel>, ...args);
    } catch (e) {
        console.error(
            `Failed to run ${cmd.name}`,
            `\n> ${msg.content}\n`,
            e
        );
        silently(reply(msg, { content: "oop, that didn't go well 💥" }));
    }
});
