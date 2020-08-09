import Bot from "../handler/Bot";
import { Guild } from "eris";

export default (client: Bot, guild: Guild): void => {
    // AddGuild(guild.id);
    client.editStatus(`online`, {
        type: 0,
        name: `with ${client.guilds.size} servers | Do ${client.prefix}help!`
    });
};
