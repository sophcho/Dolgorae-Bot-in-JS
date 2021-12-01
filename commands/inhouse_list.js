const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('내전_신청자_리스트')
		.setDescription('내전 리스트를 신청한 순서대로 봅니다'),
	async execute(interaction) {
		const serverid = interaction.guildId;
		const sql = 'SELECT userid FROM `inhouse_list` WHERE server = \'' + serverid + '\' ORDER BY number ASC';
		const { con } = require('../index.js');

		try {
			let qryresult;
			con.query(sql, function(err, result) {
				if (err) throw err;
				console.log(result);
				qryresult = result;
			});
			await wait(400);

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
				member = await interaction.guild.members.fetch({ user: userid, cache: false });
				msg += (i + 1) + ': ' + member.displayName + ' (' + member.user.tag + ')\n';
				console.log(msg);
			}

			await interaction.reply({ content: msg, ephemeral: true });
		}
		catch (error) {
			console.error(error);
		}
	},
};