import { eq, sql } from "drizzle-orm";

import { Vennie } from "../Client";
import { PREFIX } from "../constants";
import { db } from "../db";
import { User, users } from "../schema";
import { reply, silently } from "../util";
import { getLevelForXp, getXpForMessage } from "../util/xpMath";

const eligibleChannels = new Set([
    // chat
    "1015060231060983891", // off topic
    "1121201005456011366", // german
    "1026504914131759104", // regulars
    "1223973149222375536", // programming
    "1232316599697149982", // international

    // development
    "1015063227299811479", // core
    "1032770730703716362", // plugin
    "1134844326933954622", // theme
    "1216096100382019634", // website
    "1216096162008924291", // vesktop
    "1215380773033476106", // client mod wiki
]);

const rewards = {
    10: "1136687385434918992",
    //20: "1026504932959977532"
} as const;

const cooldowns: Record<string, number> = {};

Vennie.on("messageCreate", async msg => {
    if (!msg.inCachedGuildChannel()) return;
    if (msg.author.bot) return;

    if (!msg.content) return; // just an image

    if (msg.content.startsWith(PREFIX)) return; // ignore potential bot commands

    if (!eligibleChannels.has(msg.channelID)) return;

    if (cooldowns[msg.author.id] > Date.now()) return;

    cooldowns[msg.author.id] = Date.now() + (2.5 * 60000); // 2.5 minutes

    const xp = getXpForMessage(msg);

    const oldXp = (db.select({ xp: users.xp })
        .from(users)
        .where(eq(users.id, msg.author.id))
        .get())?.xp ?? 0;

    const user: User = db.insert(users)
        .values({ id: msg.author.id, xp })
        .onConflictDoUpdate({ target: users.id, set: { xp: sql`${users.xp} + ${xp}` } })
        .returning().get();

    const oldLevel = getLevelForXp(oldXp);
    const newLevel = getLevelForXp(user.xp);

    if (newLevel > oldLevel) {
        const rewardsToBeIssued: string[] = [];

        for (const level of Object.keys(rewards)) {
            const l = parseInt(level);
            if (l > newLevel) break;

            const roleId = rewards[level];

            if (msg.member.roles.includes(roleId)) continue;
            rewardsToBeIssued.push(roleId);
        }

        if (rewardsToBeIssued.length > 0) {
            for (const roleId of rewardsToBeIssued) {
                await msg.member.addRole(roleId, "level up!");
            }
        }
    }
});
