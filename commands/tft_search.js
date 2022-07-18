const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const log4js = require('log4js');
const logger = log4js.getLogger('log');
const {leagueAPI, tftAPI, leagueVersion } = require('../config.json');
const TeemoJS = require('teemojs');
let leagueapi = TeemoJS(leagueAPI);
let tftapi = TeemoJS(tftAPI);
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tft')
        .addStringOption((option) =>
            option 
                .setName('summoner_name')
                .setDescription('Enter the name of the summoner you would like to look up.')
                .setRequired(true),
        )
        .setDescription('Look up TFT rank, win rate, and average rank of a summoner',),
    

    async execute(interaction)
    {
        await interaction.reply({ content: 'Fetching summoner information...',  ephemeral: false });
        const name = interaction.options.getString('summoner_name');
        
        async function extract(name)
        {
            try{ 
                let url = 'https://lolchess.gg/profile/na/' + name.replace(/ /g,'');
                const { data } = await axios.get(url);
                const $ = cheerio.load(data); 
                const avgrnk = $("div span.profile__tier__stat__value.float-right");
                const result = [];
                avgrnk.each(function(inx, el){
                    result.push($(el).text());
                    
                });
                return result;
            } catch (err) {
                console.error(err);
            }
        }

        async function embed()
        {
            let result = await extract(name);
            console.log(result);
            let iconURL, lolchessURL, summonerv4;
            await tftapi.get('na1', 'tftSummoner.getBySummonerName', name)
                .then(data => { console.log(data); iconURL = 'http://ddragon.leagueoflegends.com/cdn/' + leagueVersion + '/img/profileicon/' + data.profileIconId + '.png';
                lolchessURL = 'https://lolchess.gg/profile/na/' + data.name.replace(/ /g,'');
            summonerv4 = data;});

           
            let tft, embeds;
            await tftapi.get('na1', 'tftLeague.getLeagueEntriesForSummoner', summonerv4.id)
                .then(data => {
                                console.log(data);
                                tft = data;
                                let color = 0xa195d9;
                                let value;
                                if (tft.length == 0){
                                    value = "```fix\nUnranked```";
                                }else{
                                    value = "```fix\n" + tft[0].tier + ' ' + tft[0].rank + ' ' + tft[0].leaguePoints + 'LP'+ "```";
                                }
                                embeds = 
                                {
                                "title": summonerv4.name,
                                "description": '<:tft:984860962391740426> TFT',
                                "color": color,
                                "fields": [
                                    {
                                        "name": `Rank`,
                                        "value": value,
                                        "inline": false
                                    },
                                    {
                                        "name": `Wins`,
                                        "value": "```\n" + result[0] + "```" ,
                                        "inline": true
                                    },
                                    {
                                        "name": `Top 4`,
                                        "value": "```\n" +result[2] + "```",
                                        "inline": true
                                    },
                                    {
                                        "name": `Played`,
                                        "value": "```\n" +result[4] + "```",
                                        "inline": true
                                    },
                                    {
                                        "name": `Win Rate`,
                                        "value": "```yaml\n" +result[1] + "```",
                                        "inline": true
                                    },
                                    {
                                        "name": `Top 4 Rate`,
                                        "value": "```yaml\n" +result[3] + "```",
                                        "inline": true
                                    },
                                    {
                                        "name": `Avg. Rank`,
                                        "value": "```cs\n" +result[5] + "```",
                                        "inline": true
                                    }


                                ],
                                "thumbnail": {
                                    "url": iconURL,
                                },
                               //'timestamp': new Date(),
                                "footer": {
                                     "text": "✨Update your profile on LoLChess.GG for most updated info!✨",
                                },
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
            
            return { embeds, row };
        }
        
        const { embeds, row } = await embed(name);
        console.log(row);
        await interaction.editReply({ content: ' ',  embeds: [embeds], components: [row], ephemeral: false });

    },
};

