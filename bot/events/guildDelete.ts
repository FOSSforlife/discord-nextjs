import Bot from "../handler/Bot";

export default (client: Bot): void => {
    client.editStatus(`online`, {
        type: 0,
        name: `with ${client.guilds.size} servers | Do ${client.prefix}help!`
    });
};
