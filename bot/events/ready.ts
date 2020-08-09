import Bot from "../handler/Bot";

export default (client: Bot): void => {
    console.log(`I am ready.`);
    setTimeout(() => client.editStatus(`online`, {
        type: 0,
        name: `with ${client.guilds.size} servers | Do ${client.prefix}help!`
    }), 60000);
};
