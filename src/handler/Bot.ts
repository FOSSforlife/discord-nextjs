import { CommandClient, ClientOptions, CommandClientOptions, CommandGenerator } from "eris";
import * as path from "path";
import fs from "fs";
import CommandParams from "./CommandParams";
import { createConnection } from "typeorm";
import express from "express";
import http from "http";
import { CronJob } from 'cron';

export interface BotOptions {
    apikeys: {
        lastFM: string;
        youtube?: string;
        spotify?: {
            id: string;
            secret: string;
        };
        dbl?: string;
    };
    ownerID: string;
}

export default class Bot extends CommandClient {
    public readonly prefix: string;
    public readonly apikeys: {
        readonly lastFM: string;
        readonly youtube?: string;
        readonly spotify?: {
            readonly id: string;
            readonly secret: string;
        };
        readonly dbl?: string;
    };
    public readonly ownerID: string;
    public readonly guildPrefixes: { [s: string]: string };
    public readonly guildCronJobs: { [s: string]: {
        leaderboardPost?: CronJob,
        spotifyPost?: CronJob
    }};

    public constructor(token: string, options: ClientOptions, commandOptions: CommandClientOptions, config: BotOptions) {
        super(token, options, commandOptions);
        this.apikeys = config.apikeys;
        this.ownerID = config.ownerID;
        this.prefix = commandOptions.prefix as string;
        this.guildPrefixes = {};
        this.guildCronJobs = {};
    }

    private loadCommands(dir: string = path.join(__dirname, `..`, `commands`)): this {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            if (file.endsWith(`.js`) || file.endsWith(`.ts`)) {
                const CommandParam = require(path.join(dir, file)).default;
                const cParams: CommandParams = new CommandParam();
                const command = this.registerCommand(cParams.name, cParams.execute as CommandGenerator, cParams.options);
                try {
                    const subDir = path.join(dir, file).slice(0, -3);
                    const lstat = fs.lstatSync(subDir);
                    if (lstat.isDirectory()) {
                        const subFiles = fs.readdirSync(subDir);
                        subFiles.forEach(subFile => {
                            const SubcommandParam = require(path.join(subDir, subFile)).default;
                            const sParams: CommandParams = new SubcommandParam();
                            command.registerSubcommand(sParams.name, sParams.execute as CommandGenerator, sParams.options);
                        });
                    }
                } catch (e) {
                    if (!e.message.startsWith(`ENOENT`)) {
                        console.error(e);
                    }
                }
            }
        });
        return this;
    }

    private loadEvents(dir: string = path.join(__dirname, `..`, `events`)): this {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            if (file.endsWith(`.js`) || file.endsWith(`.ts`)) {
                const event: Function = require(path.join(dir, file)).default;
                const eventName = file.substring(0, file.length - 3);
                this.on(eventName, event.bind(null, this));
            }
        });
        return this;
    }

    private async loadEntities(dir: string = path.join(__dirname, `..`, `entities/*.{ts,js}`)): Promise<this> {
        await createConnection({
            type: `postgres`,
            url: process.env.DATABASE_URL,
            entities: [dir],
            synchronize: true
        });
        return this;
    }

    private addExpressListener(): this {
        const app = express();

        app.get(`/`, (request, response) => {
            response.sendStatus(200);
        });

        app.listen(process.env.PORT);

        setInterval(() => {
            http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
        }, 280000);

        return this;
    }

    private async loadPrefixes(): Promise<this> {
        // const prefixes = await Prefixes.find();
        // prefixes.forEach(({ guildID, prefix }) => {
        //     this.registerGuildPrefix(guildID, prefix);
        // });
        return this;
    }

    private async loadGuildSettings(): Promise<this> {
        // const guilds = await Guilds.find();
        // guilds.forEach(({ discordID, guildSettings }) => {
        //     this.registerGuildPrefix(discordID, guildSettings.prefix);

        //     let leaderboardJob, spotifyJob: CronJob;
        //     this.guildCronJobs[discordID] = {};
        //     if(guildSettings.leaderboard.enable && guildSettings.leaderboard.channelID) {
        //         const { frequency, weekResetDay, resetHour } = guildSettings.leaderboard;
        //         switch(frequency) {
        //             case LeaderboardFrequency.Daily:
        //                 leaderboardJob = new CronJob(`0 0 ${resetHour} * * *`, () => {
        //                     leaderboardPost(guildSettings, discordID, this);
        //                 }, undefined, undefined, undefined, undefined, undefined, 0);
        //                 break;
        //             case LeaderboardFrequency.Weekly:
        //                 leaderboardJob = new CronJob(`0 0 ${resetHour} * * ${weekResetDay}`, () => {
        //                     leaderboardPost(guildSettings, discordID, this);
        //                 }, undefined, undefined, undefined, undefined, undefined, 0);
        //                 break;
        //             case LeaderboardFrequency.Monthly:
        //                 leaderboardJob = new CronJob(`0 0 ${resetHour} 1 * *`, () => {
        //                     leaderboardPost(guildSettings, discordID, this);
        //                 }, undefined, undefined, undefined, undefined, undefined, 0);
        //                 break;
        //         }
        //         leaderboardJob.start();
        //         this.guildCronJobs[discordID].leaderboardPost = leaderboardJob;
        //     }

        //     if(guildSettings.spotify.playlist) {
        //         const { frequency, hour } = guildSettings.spotify.playlist.postTime;
        //         switch(frequency) {
        //             case LeaderboardFrequency.Daily:
        //                 spotifyJob = new CronJob(`0 0 ${hour} * * *`, () => {
        //                     spotifyPost(discordID);
        //                 }, undefined, undefined, undefined, undefined, undefined, 0);
        //                 break;
        //             case LeaderboardFrequency.Weekly:
        //                 const day = (guildSettings.spotify.playlist.postTime as LeaderboardPostTimeWeekly).day;
        //                 spotifyJob = new CronJob(`0 0 ${hour} * * ${day}`, () => {
        //                     spotifyPost(discordID);
        //                 }, undefined, undefined, undefined, undefined, undefined, 0);
        //                 break;
        //             case LeaderboardFrequency.Monthly:
        //                 spotifyJob = new CronJob(`0 0 ${hour} 1 * *`, () => {
        //                     spotifyPost(discordID);
        //                 }, undefined, undefined, undefined, undefined, undefined, 0);
        //                 break;
        //         }
        //         spotifyJob.start();
        //         this.guildCronJobs[discordID].spotifyPost = spotifyJob;
        //     }
        // })
        return this;
    }

    public init(): void {
        this.loadCommands()
            .loadEvents()
            .addExpressListener()
            .loadEntities()
            .then(client => client.loadGuildSettings())
            .then(client => client.connect());
    }
}
