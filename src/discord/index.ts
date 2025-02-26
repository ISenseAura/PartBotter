import { Client, Events, GatewayIntentBits } from 'discord.js';
import { token } from '@/config/discord';

import loadDiscord from '@/discord/loaders';
import chatHandler from '@/discord/handlers/chat';

const Discord = new Client({ intents: [GatewayIntentBits.Guilds] });
Discord.once(Events.ClientReady, readyClient => log(`Connected to Discord! [${readyClient.user.tag}]`));

if (process.env.USE_DISCORD) loadDiscord().then(() => Discord.login(token));

Discord.on(Events.InteractionCreate, chatHandler);

global.Discord = Discord;

export default Discord;
