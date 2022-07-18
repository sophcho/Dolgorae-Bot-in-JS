const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const log4js = require('log4js');
const logger = log4js.getLogger('log');
const {  leagueAPI, leagueVersion } = require('../config.json');
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
        .setName('search')
        .addStringOption((option) =>
            option
                .setName('summoner_name')
                .setDescription('Enter the name of the summoner you would like to look up.')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName('queue_type')
                .setDescription('Select queue type')
                .setRequired(true)
                .addChoice('solo', 'Solo Queue')
                .addChoice('flex', 'Flex Queue'),
        )
        .setDescription('Look up Solo and Flex Queue stats of a summoner',),

    async execute(interaction)
    {
        await interaction.reply({ content: 'Fetching summoner information...',  ephemeral: false });
        const name = interaction.options.getString('summoner_name');
        // need to call (summonername)summonerv4 (ids, profileicon, level) -> (summonerid)leaguev4 (stats)

        // Unique: rank, wins + losses, winrate (check choice)

        async function embed()
        {

            const summonerv4 = await kayn.Summoner.by.name(name);
    
            let level = summonerv4.summonerLevel;
            let iconURL = 'http://ddragon.leagueoflegends.com/cdn/' + leagueVersion + '/img/profileicon/' + summonerv4.profileIconId + '.png';
            let opggURL = 'https://na.op.gg/summoners/na/' + summonerv4.name.replace(/ /g,'');

            const leaguev4 = await kayn.League.Entries.by.summonerID(summonerv4.id);
            console.log(leaguev4)
            let queue_type, color;
            console.log(interaction.options.getString('queue_type'));
            if (interaction.options.getString('queue_type') === "Solo Queue"){
                queue_type = "RANKED_SOLO_5x5";
                color = 0xa195d9;
            }
            else{
                queue_type = "RANKED_FLEX_SR";
                color = 0xcef5a6;
            }

            let tier, rank, leaguePoints, wins, losses;

            for (let i = 0; i < leaguev4.length; i++){
                if (leaguev4[i].queueType === queue_type){
                    tier = leaguev4[i].tier;
                    rank = leaguev4[i].rank;
                    leaguePoints = leaguev4[i].leaguePoints;
                    wins = leaguev4[i].wins;
                    losses = leaguev4[i].losses;
                }
            }
            
            let winrate = (wins / (wins + losses) * 100).toFixed(2);

            const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Link to OP.GG')
					.setStyle('LINK')
                    .setURL(opggURL)
					.setEmoji('❤️'),
			);

            const embeds = 
                {
                "title": summonerv4.name,
                "description": ':trophy: ' + interaction.options.getString('queue_type'),
                 "color": color,
                "fields": [
                    {
                        "name": `Rank`,
                        "value": '```css\n[' + tier + ' ' + rank + ' ' + leaguePoints + 'LP' + "]```",
                        
                    },
                    {
                        "name": `Level`,
                        "value": "```fix\n" + level.toString() + "```",
                        "inline": false
                    },
                    {
                        "name": `Wins`,
                        "value": "```cs\n" +wins.toString()+ "```",
                        "inline": true
                    },
                    {
                        "name": `Losses`,
                        "value": "```cs\n" +losses.toString()+ "```",
                        "inline": true
                    },
                    {
                        "name": `Winrate`,
                        "value": "```css\n" +winrate + "%"+ "```",
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
                "url": opggURL,
            };

            return { embeds, row };
        }
        
        const { embeds, row } = await embed(name);
        console.log(row);
        await interaction.editReply({ content: ' ',  embeds: [embeds], components: [row], ephemeral: false });

    },
};

