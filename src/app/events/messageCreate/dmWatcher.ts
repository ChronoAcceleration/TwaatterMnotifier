import { extractAndCheckTwitterLinks, isAffirmative } from '../../utility';
import { EventHandler, Logger } from 'commandkit';
import { ChannelType, Message } from 'discord.js';

type CollectedLinks = {
    twitter: string[];
    other: string[];
};

const pendingByUser = new Map<string, CollectedLinks>();

function collectLinksFromText(text: string): CollectedLinks {
    const collected: CollectedLinks = { twitter: [], other: [] };
    const results = extractAndCheckTwitterLinks(text);

    for (const r of results) {
        if (!r.isValid) continue;
        if (r.isTwitter) collected.twitter.push(r.url);
        else collected.other.push(r.url);
    }
    return collected;
}

function buildConfirmationMessage(collected: CollectedLinks): string | null {
    const twitterCount = collected.twitter.length;
    const otherCount = collected.other.length;

    if (twitterCount > 0 && otherCount > 0) {
        return `I found ${twitterCount} twitter link${twitterCount > 1 ? 's' : ''} and some irrelevant link I'll ignore. should I track them?`;
    } else if (twitterCount > 1) {
        return `I found ${twitterCount} twitter links should I track?`;
    } else if (twitterCount === 1) {
        return `I found 1 twitter link should I track it?`;
    } else if (otherCount > 0 && twitterCount === 0) {
        return `yo, you posted stuff that aren't twitter.. I only do twitter`;
    } else {
        return null;
    }
}

async function beginTrack(collected: CollectedLinks, message: Message) {
    Logger.log('process comp')
}

const handler: EventHandler<'messageCreate'> = async (message) => {
    if (message.channel.type !== ChannelType.DM) return;
    if (message.author.bot) return;

    const userId = message.author.id;

    if (pendingByUser.has(userId) && isAffirmative(message.content)) {
        const pending = pendingByUser.get(userId)!;
        pendingByUser.delete(userId);
        await beginTrack(pending, message);
        return;
    }

    const collected = collectLinksFromText(message.content);
    const response = buildConfirmationMessage(collected);

    if (response) {
        if (collected.twitter.length > 0) {
            pendingByUser.set(userId, collected);
        }
        await message.channel.send(response);
    } else {
        await message.channel.send(`heyo! send me a twitter link and i can start tracking for ya!`);
    }
};

export default handler;
