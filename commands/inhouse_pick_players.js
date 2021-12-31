const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('내전_참가자_뽑기')
		.setDescription('내전에 참가 할 사람들을 리스트순으로 뽑고 나머지 ')
		.addIntegerOption(option =>
			option.setName('플레이어_수')
				.setDescription('숫자로만 적어주세요.')
				.setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			await interaction.reply({ content: '내전 커맨드를 사용할 권한이 없습니다.', ephemeral: true });
			return;
		}

		const serverid = interaction.guildId;
		const maxcount = interaction.options.getInteger('플레이어_수');
		let list_count;
		const { pool } = require('../index.js');

		const list_count_sql = 'SELECT COUNT (*) FROM `inhouse_list` WHERE server = ' + serverid;

		pool.getConnection(function(err, connection) {
			if (err) throw err;
			connection.query(list_count_sql, function(err, result) {
				console.log(result);
				list_count = result;
				connection.release();
				if (err) throw err;
			});
		});

		await wait(200);

		if (list_count[0]['COUNT (*)'] < maxcount) {
			await interaction.reply({ content: '내전 신청자가 부족합니다. 현재 ' + list_count[0]['COUNT (*)'] + '/' + maxcount + ' 명이 신청했습니다.', ephemeral: true });
			return;
		}

		await wait(200);

		const sql = 'SELECT userid FROM `inhouse_list` WHERE server = \'' + serverid + '\' ORDER BY number ASC';

		try {
			let qryresult;
			pool.getConnection(function(err, connection) {
				if (err) throw err;
				connection.query(sql, function(err, result) {
					console.log(result);
					qryresult = result;
					connection.release();
					if (err) throw err;
				});
			});

			await wait(400);

			let msg = '🔔참가인원 ' + maxcount + '명은: ';
			let userid;
			let member;
			for (let i = 0; i < maxcount; i++) {
				userid = qryresult[i]['userid'];
				console.log(userid);
				userid = userid.toString();
				member = await interaction.guild.members.fetch({ user: userid, cache: false });
				if (i === maxcount - 1) {
					msg += `${member} 입니다.\n\n`;
				}
				else {
					msg += `${member}, `;
				}

				console.log(msg);
			}

			msg += '대기자명단: ';

			for (let i = maxcount; i < qryresult.length; i++) {
				userid = qryresult[i]['userid'];
				console.log(userid);
				userid = userid.toString();
				member = await interaction.guild.members.fetch({ user: userid, cache: false });
				if (i - 1 === maxcount) {
					msg += `${member}`;
				}
				else {
					msg += `${member}, `;
				}
				console.log(msg);
			}

			if (maxcount === qryresult.length) {
				msg += '없음';
			}

			await interaction.reply({ content: msg });
		}
		catch (error) {
			console.error(error);
		}

	},
};