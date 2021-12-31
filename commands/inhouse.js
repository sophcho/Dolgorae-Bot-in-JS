/* eslint-disable no-mixed-spaces-and-tabs */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { Permissions } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('내전')
		.setDescription('내전 생성을 위한 커맨드입니다.')
		.addStringOption(option =>
			option.setName('게임')
				.setDescription('게임을 골라주세요.')
				.setRequired(true)
				.addChoice('롤', '리그 오브 레전드')
				.addChoice('발로', '발로란트'))
		.addStringOption(option =>
			option.setName('날짜')
				.setDescription('예시: "11/30/21"')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('모드')
				.setDescription('모드를 골라주세요.')
				.setRequired(true)
				.addChoice('내전', '내전')
				.addChoice('토너먼트', '토너먼트'))
		.addStringOption(option =>
			option.setName('시간')
				.setDescription('예시: 8:30PM EST')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('플레이어_수')
				.setDescription('숫자로만 적어주세요.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('디테일1')
				.setDescription('그 외 디테일을 한 줄 안으로 적어주세요.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('디테일2')
				.setDescription('그 외 디테일을 한 줄 안으로 적어주세요')
				.setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			await interaction.reply({ content: '내전 커맨드를 사용할 권한이 없습니다.', ephemeral: true });
			return;
		}
		const log4js = require('log4js');
		log4js.configure({
			appenders: { log: { type: 'file', filename: 'debug.log' } },
			categories: { default: { appenders: ['log'], level: 'all' } },
		});

		const logger = log4js.getLogger('log');

		const guildid = interaction.guildId;
		const sql = 'DELETE FROM `inhouse_list` WHERE server = \'' + guildid + '\'';
		const { pool } = require('../index.js');

		try {
			pool.getConnection(function(err, connection) {
				if (err) {
					logger.error(err);
					throw err;
				}
				connection.query(sql, function(err, result) {
					if (err) {
						logger.error(err);
						throw err;
					}
					connection.release();
					if (err) {
						logger.error(err);
						throw err;
					}
				});
			});
		}
		catch (error) {
			logger.error(error);
		}


		const game = interaction.options.getString('게임');
		const date = interaction.options.getString('날짜');
		const mode = interaction.options.getString('모드');
		const time = interaction.options.getString('시간');
		const maxcount = interaction.options.getInteger('플레이어_수');
		const detail = interaction.options.getString('디테일1');
		const detail2 = interaction.options.getString('디테일2');

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('signup')
					.setLabel('참가하기')
					.setStyle('PRIMARY')
					.setEmoji('❤️'),
			);

		const row2 = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('league_tier')
					.setPlaceholder('Tier')
					.addOptions([
						{
							label: 'Iron',
							value: 'iron',
						},
						{
							label: 'Bronze',
							value: 'bronze',
						},
						{
							label: 'Silver',
							value: 'silver',
						},
						{
							label: 'Gold',
							value: 'gold',
						},
						{
							label: 'Platinum',
							value: 'platinum',
						},
						{
							label: 'Diamond',
							value: 'diamond',
						},
						{
							label: 'Master',
							value: 'master',
						},
						{
							label: 'Grandmaster',
							value: 'grandmaster',
						},
						{
							label: 'Challenger',
							value: 'challenger',
						},
					]),
			);

		const row2v = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('valorant_tier')
					.setPlaceholder('Tier')
					.addOptions([
						{
							label: 'Iron',
							value: 'Iron',
						},
						{
							label: 'Bronze',
							value: 'Bronze',
						},
						{
							label: 'Silver',
							value: 'Silver',
						},
						{
							label: 'Gold',
							value: 'Gold',
						},
						{
							label: 'Platinum',
							value: 'Platinum',
						},
						{
							label: 'Diamond',
							value: 'Diamond',
						},
						{
							label: 'Immortal',
							value: 'Immortal',
						},
						{
							label: 'Radiant',
							value: 'Radiant',
						},
					]),
			);

		const row3 = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('league_rank')
					.setPlaceholder('Rank')
					.addOptions([
						{
							label: '1',
							value: '1',
						},
						{
							label: '2',
							value: '2',
						},
						{
							label: '3',
							value: '3',
						},
						{
							label: '4',
							value: '4',
						},
					]),
			);

		const row3v = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('valorant_rank')
					.setPlaceholder('Rank')
					.addOptions([
						{
							label: '1',
							value: '1',
						},
						{
							label: '2',
							value: '2',
						},
						{
							label: '3',
							value: '3',
						},
					]),
			);

		const row4 = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('position')
					.setPlaceholder('Position')
					.setMinValues(1)
					.setMaxValues(5)
					.addOptions([
						{
							label: 'TOP',
							value: 'Top',
							emoji: '🤡',
						},
						{
							label: 'JUNGLE',
							value: 'Jungle',
							emoji: '👨‍🌾',
						},
						{
							label: 'MID',
							value: 'Mid',
							emoji: '👑',
						},
						{
							label: 'ADC',
							value: 'Adc',
							emoji: '🥄',
						},
						{
							label: 'SUPPORT',
							value: 'Support',
							emoji: '🛠️',
						},
					]),
			);


		let game_url = {};
		if (game === '리그 오브 레전드') {
			game_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/LoL_icon.svg/256px-LoL_icon.svg.png';
		}
		else {
			game_url = 'https://images.squarespace-cdn.com/content/v1/604ca3ed000a5a493861d5b2/1615740688969-ERXFZMHFFU9MA8RFUWB4/VALORANT_Logo_square.png';
		}

		const embed = {
			  'color': 4830600,
			  'footer': {
				'text': 'created by dolphin#0001',
			  },
			  'thumbnail': {
				'url': game_url,
			  },

			  'fields': [
				{
				  'name': game + ' ' + mode,
				  'value': '🌎 NA\n🗓️ ' + date + '\n⏰ ' + time + '\n⚔️ ' + detail + '\n:mage: 선착순 ' + maxcount + '명',
				},
				{
				   'name': ':loudspeaker:',
				  'value': detail2,
				},
			  ],
		};

		logger.info('Inhouse was created at ' + interaction.guild.name + ' by ' + interaction.user.tag + '.');

		if (game === '리그 오브 레전드') {
			await interaction.reply({ content: ' ', embeds: [embed], components: [row2, row3, row4, row] });
		}
		else {
			await interaction.reply({ content: ' ', embeds: [embed], components: [row2v, row3v, row] });
		}


	},

};
