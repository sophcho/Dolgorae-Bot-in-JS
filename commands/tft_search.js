const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const log4js = require('log4js');
const logger = log4js.getLogger('log');
const {devAPI, leagueVersion } = require('../config.json');
const TeemoJS = require('teemojs');
let api = TeemoJS(devAPI);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tft')
        .addStringOption((option) =>
            option
                .setName('summoner_name')
                .setDescription('Enter the name of the summoner you would like to look up.')
                .setRequired(true),
        )
        .setDescription('asdfasdf',),

    async execute(interaction)
    {
        await interaction.reply({ content: 'Fetching summoner information...',  ephemeral: false });
        const name = interaction.options.getString('summoner_name');

        async function embed()
        {
            let iconURL, lolchessURL, summonerv4;
            await api.get('na1', 'summoner.getBySummonerName', name)
                .then(data => { console.log(data); iconURL = 'http://ddragon.leagueoflegends.com/cdn/' + leagueVersion + '/img/profileicon/' + data.profileIconId + '.png';
                lolchessURL = 'https://lolchess.gg/profile/na/' + data.name.replace(/ /g,'');
            summonerv4 = data;});
           
            let tft, embeds;
            await api.get('na1', 'tftLeague.getLeagueEntriesForSummoner', summonerv4.id)
                .then(data => {
                                console.log(data);
                                tft = data;
                                let color = 0xa195d9;
                                let winrate = (tft[0].wins / (tft[0].wins + tft[0].losses) * 100).toFixed(2);
                                
                                embeds = 
                                {
                                "title": summonerv4.name,
                                "description": '<:tft:984860962391740426> TFT',
                                "color": color,
                                "fields": [
                                    {
                                        "name": `Rank`,
                                        "value": tft[0].tier + ' ' + tft[0].rank + ' ' + tft[0].leaguePoints + 'LP',
                                        "inline": false
                                    },
                                    {
                                        "name": `Wins`,
                                        "value": (tft[0].wins).toString(),
                                        "inline": true
                                    },
                                    {
                                        "name": `Losses`,
                                        "value": (tft[0].losses).toString(),
                                        "inline": true
                                    },
                                    {
                                        "name": `Winrate`,
                                        "value": winrate + "%",
                                        "inline": true
                                    }
                                ],
                                "thumbnail": {
                                    "url": iconURL,
                                },
                               'timestamp': new Date(),
                                // "footer": {
                                //     "text": `Most recent game here`,
                                //     //"icon_url": `link to champ icon`
                                // },
                                "url": lolchessURL,
                            };
                });


            const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Link to LoLCHESS.GG')
					.setStyle('LINK')
                    .setURL(lolchessURL)
					.setEmoji('❤️'),
			);

            // const embeds = 
            //     {
            //     "title": summonerv4.name,
            //     "description": '<:tft:984860962391740426> TFT',
            //     "color": color,
            //     "fields": [
            //         {
            //             "name": `Rank`,
            //             "value": tft.tier + ' ' + tft.rank + ' ' + tft.leaguePoints + 'LP',
            //             "inline": true
            //         },
            //         {
            //             "name": `Wins`,
            //             "value": (tft.wins).toString(),
            //             "inline": true
            //         },
            //         {
            //             "name": `Losses`,
            //             "value": (tft.losses).toString(),
            //             "inline": true
            //         },
            //         {
            //             "name": `Winrate`,
            //             "value": winrate + "%",
            //             "inline": true
            //         }
            //     ],
            //     "thumbnail": {
            //         "url": iconURL,
            //     },
            //    'timestamp': new Date(),
            //     // "footer": {
            //     //     "text": `Most recent game here`,
            //     //     //"icon_url": `link to champ icon`
            //     // },
            //     "url": lolchessURL,
            // };

            return { embeds, row };
        }
        
        const { embeds, row } = await embed(name);
        console.log(row);
        await interaction.editReply({ content: ' ',  embeds: [embeds], components: [row], ephemeral: false });

    },
};

