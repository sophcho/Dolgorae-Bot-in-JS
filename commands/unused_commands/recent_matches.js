const paginationEmbed = require('discordjs-button-pagination');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton} = require('discord.js');
const log4js = require('log4js');
const logger = log4js.getLogger('log');
const { riotAPI, leagueVersion } = require('../../config.json');
const { Kayn, REGIONS, KaynRequest } = require('kayn');
const kayn = Kayn(riotAPI)({
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
        .setName('recentmatches')
        .addStringOption((option) =>
            option
                .setName('summoner_name')
                .setDescription('Enter the name of the summoner you would like to look up.')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName('queue_type')
                .setDescription('Select queue type (Default is solo queue)')
                .setRequired(false)
                .addChoice('solo', 'solo')
                .addChoice('flex', 'flex')
                .addChoice('all', 'all'),
        )
        .setDescription('Looks up the recent 5 matches of the summoner',),

    async execute(interaction)
    {
        await interaction.reply({ content: 'Fetching summoner information...',  ephemeral: false });
        const name = interaction.options.getString('summoner_name');
        const queueType = interaction.options.getString('queue_type');

        async function embed()
        {

            const summonerv4 = await kayn.Summoner.by.name(name);
    
            let iconURL = 'http://ddragon.leagueoflegends.com/cdn/' + leagueVersion + '/img/profileicon/' + summonerv4.profileIconId + '.png';
            let opggURL = 'https://na.op.gg/summoners/na/' + summonerv4.name.replace(/ /g,'');

            const matchConfig = {
                name: summonerv4.name,
                options: {
                  queue: 420,
                  count: 5
                }
              }

            const matchv5 = await kayn.Matchlist.by.puuid(matchConfig);
            console.log(matchv5)
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
                        "value": tier + ' ' + rank + ' ' + leaguePoints + 'LP',
                        "inline": true
                    },
                    {
                        "name": `Level`,
                        "value": level.toString(),
                        "inline": false
                    },
                    {
                        "name": `Wins`,
                        "value": wins.toString(),
                        "inline": true
                    },
                    {
                        "name": `Losses`,
                        "value": losses.toString(),
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
                "url": opggURL,
            };

            return { embeds, row };
        }
        
        const { embeds, row } = await embed(name);
        console.log(row);
        await interaction.editReply({ content: ' ',  embeds: [embeds], components: [row], ephemeral: false });

    },
};







// const { MessageEmbed , MessageButton} = require('discord.js');
// const embed1 = new MessageEmbed()
//                 .setTitle('First Page')
//                 .setDescription('This is the first page');

// const embed2 = new MessageEmbed()
//                 .setTitle('Second Page')
//                 .setDescription('This is the second page');

// const button1 = new MessageButton()
//                 .setCustomId('previousbtn')
//                 .setLabel('Previous')
//                 .setStyle('DANGER');

// const button2 = new MessageButton()
//                 .setCustomId('nextbtn')
//                 .setLabel('Next')
//                 .setStyle('SUCCESS');

// // Create an array of embeds
// pages = [
// 	embed1,
// 	embed2,
// 	//....
// 	//embedN
// ];

// //create an array of buttons

// buttonList = [
//     button1,
//     button2
// ]


// // Call the paginationEmbed method, first three arguments are required
// // timeout is the time till the reaction collectors are active, after this you can't change pages (in ms), defaults to 120000
// paginationEmbed(interaction, pages, buttonList, timeout);