const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const log4js = require('log4js');
const logger = log4js.getLogger('log');
const { leagueAPI, leagueVersion } = require('../config.json');
const { Kayn, REGIONS, KaynRequest } = require('kayn');
const kayn = Kayn( leagueAPI)({
    region: REGIONS.NORTH_AMERICA,
    apiURLPrefix: 'https://%s.api.riotgames.com',
    locale: 'en_US',
    debugOptions: {
        isEnabled: true,
        showKey: false,
    },
    requestOptions: {
        shouldRetry: true,
        numberOfRetriesBeforeAbort: 3,
        delayBeforeRetry: 1000,
        burst: false,
        shouldExitOn403: false,
    },
    cacheOptions: {
        cache: null,
        timeToLives: {
            useDefault: false,
            byGroup: {},
            byMethod: {},
        },
    },
});


module.exports = {
    data: new SlashCommandBuilder()
        .setName('multisearch')
        .addStringOption((option) =>
            option
                .setName('lobby_text')
                .setDescription('asdfasdf')
                .setRequired(true),
        )
        .setDescription('Copy in the champion select chat directly here to generate link to OP.GG multisearch function!',),

        async execute(interaction)
        {
            
            const string = interaction.options.getString('lobby_text');
            
            const names = string.replace(/joined the room.|,|님이 로비에 참가하셨습니다./gi, '%2C');
            const namesnospace = names.replace(/ /g, '%20');
            const opggURL = "https://na.op.gg/multisearch/na?summoners=" +  namesnospace;

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel('Link to OP.GG')
                        .setStyle('LINK')
                        .setURL(opggURL)
                        .setEmoji('❤️'),
                );
            
            console.log(opggURL);

            await interaction.reply({ content: ' ',   components: [row], ephemeral: false });
    
        },
    };
    
            
