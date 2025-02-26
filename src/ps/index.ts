import { Client } from 'ps-client';
import { username, password, rooms } from '@/config/ps';

import { transformHTML } from '@/ps/handlers/html';
import loadPS from '@/ps/loaders';
import chatHandler from '@/ps/handlers/chat';
import interfaceHandler from '@/ps/handlers/interface';
import autoResHandler from '@/ps/handlers/autores';
import pageHandler from '@/ps/handlers/page';
import { joinHandler, nickHandler, leaveHandler } from '@/ps/handlers/joins';

const PS = new Client({ username, password, rooms, transformHTML });
PS.on('login', () => log(`Connected to PS! [${username}]`));

if (process.env.USE_PS) loadPS().then(() => PS.connect());

PS.on('message', chatHandler);
PS.on('message', interfaceHandler);
PS.on('message', autoResHandler);
PS.on('message', pageHandler);

PS.on('join', joinHandler);
PS.on('name', nickHandler);
PS.on('leave', leaveHandler);

global.PS = PS;

export default PS;
