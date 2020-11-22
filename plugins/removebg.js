/* Copyright (C) 2020 Yusuf Usta.

Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.

WhatsAsena - Yusuf Usta
*/

const Asena = require('../events');
const {MessageType, Mimetype} = require('@adiwajshing/baileys');
const Config = require('../config');
const fs = require('fs');
const got = require('got');
const FormData = require('form-data');
const stream = require('stream');
const {promisify} = require('util');

const pipeline = promisify(stream.pipeline);

Asena.addCommand({pattern: 'removebg ?(.*)', fromMe: true, desc: 'Fotoğrafın arka-planını siler.'}, (async (message, match) => {    
    if (message.reply_message === false || message.reply_message.image === false) return await message.sendMessage('*Bana bir fotoğraf ver!*');
    if (Config.RBG_API_KEY === false) return await message.sendMessage('*API Keyiniz Yok!*\nremove.bg adresinden alabilirsiniz.');
    
    var load = await message.reply('```Arkaplan kaldırılıyor...```');
    var location = await message.client.downloadAndSaveMediaMessage({
        key: {
            remoteJid: message.reply_message.jid,
            id: message.reply_message.id
        },
        message: message.reply_message.data.quotedMessage
    });

    var form = new FormData();
    form.append('image_file', fs.createReadStream(location));
    form.append('size', 'auto');

    var rbg = await got.stream.post('https://api.remove.bg/v1.0/removebg', {
        body: form,
        headers: {
            'X-Api-Key': Config.RBG_API_KEY
        }
    }); 
    
    await pipeline(
		rbg,
		fs.createWriteStream('rbg.png')
    );
    
    await message.sendMessage(fs.readFileSync('rbg.png'), MessageType.document, {filename: 'WhatsAsena.png', mimetype: Mimetype.png});
    await load.delete();
}));