import CommandParams from "../handler/CommandParams";
import { Message } from "eris";

export default class PingCommand extends CommandParams {

    public constructor() {
        super(`ping`, {
            usage: `ping`,
            description: `Use this to check if the bot is online.`,
        });
    }

    public async execute(message: Message): Promise<void> {
        await message.channel.createMessage(`Pong!`);
    }

}
