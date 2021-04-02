/*
    DISCORD BOT FOR LYCEE LEONARD DE VINCI
    USING PRONOTE-API 'https://github.com/Litarvan/pronote-api'
    MADE BY THEO VIDAL 'https://github.com/Dalvii'
    VERSION: 1.0
*/

const pronote = require('pronote-api');
let request = require(`request`);
let fs = require(`fs`);
const delay = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms));
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(require('./config.json').token);

const url = 'URL_PRONOTE';
const cas = 'cas'  //https://github.com/Litarvan/pronote-api#comptes-r%C3%A9gion-support%C3%A9s

const eleve_channel = 'channel_inscription_des_eleves',
    news = 'channels_annonce_nouveaux_arrivants',   // completer avec les ID correspondant
    eleve_role = 'role_eleve',
    nouveau_role = 'role_arrivants',
    serv = 'id_serveur',
    prof_role = 'role_profs',
    admin = 'role_admin',
    nom_du_lycee = 'nom_du_lycee'

client.on('ready', async () => {
    console.log('[Discord] Logged as '+ client.user.tag)
        client.user.setPresence({ activity: { name: `!eleve en DM pour obtenir votre classe (Par Théo Vidal)`}, status: 'connected' });
})


client.on('message', async message => {
    if (message.author.bot) return;

    // Inscription via Atrium
    if (message.channel.id === eleve_channel) {
        const command = message.content.trim().split(/ +/g);
        message.delete()
        if (command.length > 2) return message.channel.send('Pour vous connecter, saisissez vos identifiants **ATRIUM/PRONOTE**: `votre.identifant VotreMotDePasse`, vous obtiendrez les rôles correspondants à votre classe.').then(message => {
            message.delete({ timeout: 30000 })
            })
        if (!command[0] || !command[1]) return message.reply('Il manque des informations, pour vous connecter, saisissez vos identifiants **ATRIUM/PRONOTE**: `votre.identifant VotreMotDePasse`').then(message => {
            message.delete({ timeout: 10000 })
            })
        message.author.send('Ton compte `'+command[0] + '` a bien été pris en compte')

        let result = await atrium_get(command[0], command[1])
        if (result.error === false) {
            message.channel.send('Bienvenue '+result.name)
            account_set(result, message)
            console.log('[Lycee] added account: ' + command[0]+ ' '+message.author.username)
        } else message.reply(' Il y eu un problème, vos identifiants sont surement erronés (identifiants Atrium, pas ceux des ordinateurs du lycée)').then(message => {
            message.delete({ timeout: 30000 })
            })
    }
    if (message.channel.type === 'dm') {
        if (message.content.startsWith('!eleve')) {
            const command = message.content.slice(4).trim().split(/ +/g);
            if (!command[1] || !command[2]) return message.reply('[Connection Atrium] Il manque des informations `!eleve votre.identifant VotreMotDePasse`')
            message.reply('[Connection Atrium] Ton compte `'+command[1] + '` a bien été pris en compte')

            let result = await atrium_get(command[1], command[2])
            if (result.error === false) {
                message.channel.send(`Bienvenue ${result.name}, ta classe est ${result.classe}`)
                account_set(result, message)
                console.log('[Lycee] added account: ' + command[1])
            } else message.channel.send('Il y eu un problème, tes identifiants sont surement erronés (identifiants Atrium, pas ceux des ordinateurs du lycée)')
        } else {
            message.reply('[Connection Atrium] Pour te connecter, saisis tes identifiants **ATRIUM/PRONOTE**: `!eleve ton.identifiant TonMotDePasse`')
        }
    }


    // TAG LA CLASSE QUAND REGEX CORRESPOND
    let tag_regex = /(Bonjour à tous)|(Bonjour a tous)|(Bonsoir a tous)|(Bonsoir à tous)|(Bonsoir tout le monde)|(Bonjour tout le monde)/gi
    if (message.content.match(tag_regex) && message.member.roles.cache.find(r => r.id == prof_role)) {
        console.log('[Tag classe] regex found')
        const parent_find = message.channel.parent.name.toString().substring(0, message.channel.parent.name.length - 2)
        try {
            const role_find =  message.guild.roles.cache.find(r => r.name === parent_find);
            message.channel.send(`<@&${role_find.id}>`)
        } catch (e) {}
    }

    // Copie-colle la piece jointe d'un msg discord vers un autre channel (visible que par les profs) pour les devoirs à rendre
    if (message.channel.name === 'déposer-devoirs') {
        if(message.attachments.first()){//checks if an attachment is sent
            let channel_get = message.channel.topic
            const attachment = new Discord.MessageAttachment(message.attachments.first().url);
            client.channels.cache.get(channel_get).send('Devoirs rendu de: '+ message.member.nickname+'\n'+(message.content.length > 0 ? message.content : ''), attachment)
            message.delete()
            console.log('[Devoirs rendu] '+ message.member.nickname)
            message.channel.send('Devoirs rendu avec succés').then(message => {
                message.delete({ timeout: 30000 })
                })
        }
        let regex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
        if (message.content.match(regex)) {
            let channel_get = message.channel.topic
            client.channels.cache.get(channel_get).send('Devoirs rendu de: '+ message.member.nickname+'\n'+message.content)
            message.delete()
            console.log('[Devoirs rendu] '+ message.member.nickname)
            message.channel.send('Devoirs rendu avec succés').then(message => {
                message.delete({ timeout: 30000 })
            })
        }
    }

    // Fonction admin pour envoyer des msg a partir du bot  '!send id_channel message'
    if (message.channel.id === admin && message.content.startsWith('!send')) {
        const chann = message.content.substring(6, 24)
        const arg = message.content.substring(25)
        if (!chann || !arg) return message.reply('Il manque des infos')
        client.channels.cache.get(chann).send(arg)
    }
})



// Setup le pseudo/roles/classe avec les donnés de pronote
async function account_set(result, message) {
    let server = client.guilds.cache.get(serv);
    try {   // Change le pseudo avec le nom obtenu par Atrium
        await server.members.cache.get(message.author.id).setNickname(result.name)
        console.log('[Account set] renommage OK')

    } catch (e) {
        console.log('[Account set] echec de renommage')
        await client.channels.cache.get(news).send(message.author.username+ ': echec de renommage <@&'+admin+'>')
    }
    await server.members.cache.get(message.author.id).roles.add(eleve_role)
    await server.members.cache.get(message.author.id).roles.remove(nouveau_role)

    try {   // Change le role avec la classe obtenu par Atrium
        let role = server.roles.cache.find(role => role.name === result.classe);
        await server.members.cache.get(message.author.id).roles.add(role)
        console.log('[Account set] classe OK')
    } catch (e) {
        console.log('[Account set] classe introuvable')
        await client.channels.cache.get(news).send(message.author.username+ ': Classe introuvable <@&'+admin+'>')
    }
    await download(result.avatar, result.name)
    const attachment = new Discord.MessageAttachment('./'+result.name+'.png', result.name+'.png');
    const embed = new Discord.MessageEmbed()
        .setTitle(result.name+' en '+result.classe+' vient d\'arriver')
        .attachFiles(attachment)
        .setDescription('<@!'+message.author.id+'>')
        .setThumbnail('attachment://'+result.name+'.png')
    await client.channels.cache.get(news).send({embed:embed})
}



async function download(link, name) {
    let file = fs.createWriteStream('./'+name+'.png');     
    await new Promise((resolve, reject) => {
        let stream = request({
            uri: link,
            jar: true
        })
        .pipe(file)
        .on('finish', () => {
            console.log(`Ok`);
            resolve();
        })
        .on('error', (error) => {
            reject(error);
        })
    })
    .catch(error => {
        console.log(`Something happened: ${error}`);
    });
}



async function atrium_get(login, pass) {
    try {
        const session = await pronote.login(url, login, pass, cas);
        if (session.user.establishment.name === nom_du_lycee) {
            let result = {
                error: false,
                name: session.user.name,
                lycee: session.user.establishment.name,
                classe: session.user.studentClass.name,
                avatar: session.user.avatar,
                status: session.type.value
            }
            console.log('[Atrium API] Success ' +login)
            return result
        } else {
            return {error: true};
        }
    } catch (e) {
        console.log('[Atrium API] Failed ' +login)
        return {error: true};
    }
}