import { eq } from "drizzle-orm";

import { defineCommand } from "../Command";
import { db } from "../db";
import { users } from "../schema";
import { reply } from "../util";
import { getLevelForXp, getRequiredXpForNextLevel } from "../util/xpMath";

defineCommand({
    name: "xp",
    description: "Get your XP",
    guildOnly: true,
    usage: null,
    async execute(msg) {
        if (msg.channelID !== "1024286218801926184") return; // BEGONE, NON BOT COMMANDS

        const xp = (db.select({ xp: users.xp })
            .from(users)
            .where(eq(users.id, msg.author.id))
            .get())?.xp ?? 0;

        const level = getLevelForXp(xp);
        const levelUpXp = getRequiredXpForNextLevel(xp);

        reply(msg, `<:venniecozycat:1216803437162004561> You have ${xp} XP, making you level ${level}! You need ${levelUpXp} more XP to level up.`);
    }
});
