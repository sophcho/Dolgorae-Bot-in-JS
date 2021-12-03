const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('내전_신청자_리스트')
		.addStringOption(option =>
			option.setName('게임')
				.setDescription('각 신청자의 랭크/티어를 보고싶으시면 해당 게임을 골라주세요.')
				.setRequired(false)
				.addChoice('롤', '리그 오브 레전드')
				.addChoice('발로', '발로란트'))
		.setDescription('내전 리스트를 신청한 순서대로 봅니다. 다른 신청자들의 랭크와 티어를 보고싶으면, 해당 옵션을 선택해주세요.'),
	async execute(interaction) {
		const serverid = interaction.guildId;
		const gameselected = interaction.options.getString('게임');
		const sql = 'SELECT userid FROM `inhouse_list` WHERE server = \'' + serverid + '\' ORDER BY number ASC';
		const { con } = require('../index.js');

		try {
			let qryresult;
			con.query(sql, function(err, result) {
				if (err) throw err;
				console.log(result);
				qryresult = result;
			});
			await wait(200);

			let msg = 'There is no one in the list yet!';
			let userid;
			let member;
			for (let i = 0; i < qryresult.length; i++) {
				if (i === 0) {
					msg = '';
				}
				userid = qryresult[i]['userid'];
				console.log(userid);
				userid = userid.toString();

				let userinfoquery;
				const sql2 = 'SELECT * from `player_info` WHERE userid = \'' + userid + '\'';
				con.query(sql2, function(err, result) {
					if (err) throw err;
					console.log(result);
					userinfoquery = result;
				});

				await wait(10);

				member = await interaction.guild.members.fetch({ user: userid, cache: false });
				msg += (i + 1) + ': ' + member.displayName + ' (' + member.user.tag + ')  ';
				if (gameselected === '리그 오브 레전드') {
					msg += '``[' + userinfoquery[0]['league_tier'] + ' ' + userinfoquery[0]['league_rank'] + ' ' + userinfoquery[0]['position'] + ']``\n';
				}
				else if (gameselected === '발로란트') {
					msg += '``[' + userinfoquery[0]['valorant_tier'] + ' ' + userinfoquery[0]['valorant_rank'] + ']``\n';
				}
				else {
					msg += '\n';
				}
				console.log(msg);
			}

			await interaction.reply({ content: msg, ephemeral: true });
		}
		catch (error) {
			console.error(error);
		}
	},
};