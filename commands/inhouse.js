/* eslint-disable no-mixed-spaces-and-tabs */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
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

		const guildid = interaction.guildId;
		const sql = 'DELETE FROM `inhouse_list` WHERE server = \'' + guildid + '\'';
		const { con } = require('../index.js');
		try {
			con.query(sql, function(err, result) {
				if (err) throw err;
				console.log('Number of records deleted: ' + result.affectedRows);
			});
		}
		catch (error) {
			console.error(error);
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

		let game_url = {};
		if (game === '롤') {
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

		await interaction.reply({ content: ' ', embeds: [embed], components: [row] });
	},

};
