import Bot from "../handler/Bot";
import { Message } from "eris";

export default async (client: Bot, message: Message): Promise<void> => {
    if (message.guildID !== null) {
        if (message.mentions[0]?.id === client.user.id) {
            const prefix = client.guildPrefixes[message.guildID!];
            if (prefix !== undefined) {
                await message.channel.createMessage(`${message.author.mention}, my prefix in this server is \`${prefix}\`. ` +
                `Do \`${prefix}help\` to find out more about my functionality.`);
            } else {
                await message.channel.createMessage(`${message.author.mention}, my prefix is \`${client.prefix}\`. ` +
                `Do \`${client.prefix}help\` to find out more about my functionality.`);
            }
        }
    }
};
