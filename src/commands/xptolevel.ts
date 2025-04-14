import { eq } from "drizzle-orm";

import { defineCommand } from "../Command";
import { db } from "../db";
import { users } from "../schema";
import { reply } from "../util";
import { getXpForLevel } from "../util/xpMath";

defineCommand({
    name: "xptolevel",
    description: "get the XP needed to reach a level",
    guildOnly: true,
    usage: "[level]",
    async execute(msg, levelString) {
        if (msg.channelID !== "1024286218801926184") return; // BEGONE, NON BOT COMMANDS

        const xp = (db.select({ xp: users.xp })
            .from(users)
            .where(eq(users.id, msg.author.id))
            .get())?.xp ?? 0;

		const level = parseInt(levelString);
		const neededXp = getXpForLevel(level) - xp;
		
        reply(msg, `<:venniecozycat:1216803437162004561> You have ${xp} and need ${neededXp} more XP to reach level ${level}}.`);
    }
});