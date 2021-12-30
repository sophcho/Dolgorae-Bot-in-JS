// Require the necessary discord.js classes
const Discord = require('discord.js');
const { token } = require('./config.json');
const mysql = require('mysql');
const fs = require('fs');
const { Collection } = require('discord.js');
const wait = require('util').promisify(setTimeout);
const log4js = require('log4js');
log4js.configure({
	appenders: { log: { type: 'file', filename: 'debug.log' } },
	categories: { default: { appenders: ['log'], level: 'all' } },
});

const logger = log4js.getLogger('log');
const pool = mysql.createPool({
	host: 'na05-sql.pebblehost.com',
	user: 'customer_234512_dolgoraebot',
	password: '6!GxA7D6P09vmDLBTeqr',
	database: 'customer_234512_dolgoraebot',
});

module.exports = { pool };

// Create a new client instance
const intents = new Discord.Intents(32767);
const client = new Discord.Client({ intents });
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready, setting presence');
	logger.info('Ready, sett₩ing presence');
	client.user.setPresence({ activities: [{ name: 'v0.2.1' }], status: 'online' });
});


client.on('messageReactionAdd', async (reaction, user) => {
	const emoji2 = reaction.emoji;
	// if (user === reaction.message.author) {
	// 	return;
	// }
	if (reaction.message.channelId === '914152751083167804') {
		if (emoji2.name == '✅') {
			await reaction.message.author.send(user.username + ' reacted!');
			const userid = user.id;
			const username = user.username;
			const sql = 'INSERT INTO `inhouse_list` (userid, number, username) VALUES (' + userid + ', NULL, \'' + username + '\')';
			pool.getConnection(function(err, connection) {
				if (err) throw err;

				try {
					connection.query(sql, function(err, result) {
						if (err) throw err;
						console.log('1 record added');
						connection.release();
						if (err) throw err;
					});
				}
				catch (error) {
					console.error(error);
				}

			});

		}


	}
});

client.on('messageReactionRemove', async (reaction, user) => {
	const emoji2 = reaction.emoji;
	// if (user === reaction.message.author) {
	// 	return;
	// }
	if (reaction.message.channelId === '914152751083167804') {
		if (emoji2.name == '✅') {
			await reaction.message.author.send(user.username + ' deleted reaction!');
			const userid = user.id;
			const sql = 'DELETE FROM `inhouse_list` WHERE userid = \'' + userid + '\'';

			pool.getConnection(function(err, connection) {
				if (err) throw err;

				try {
					connection.query(sql, function(err, result) {
						if (err) throw err;
						console.log('Number of records deleted: ' + result.affectedRows);
						connection.release();
						if (err) throw err;
					});
				}
				catch (error) {
					console.error(error);
				}

			});

		}
	}
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		logger.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;

	const userid = interaction.user.id;
	const member = await interaction.guild.members.fetch(userid)
		.catch(logger.error);
	const guildId = interaction.guildId;
	const guild = interaction.guild;

	const checkifsignedup = 'SELECT * FROM `inhouse_list` WHERE userid = \'' + userid + '\' AND server = \'' + guildId + '\'';
	let signedup;

	pool.getConnection(function(err, connection) {
		if (err) {
			logger.error(err);
			throw err;
		}
		connection.query(checkifsignedup, function(err, result) {
			if (err) {
				logger.error(err);
				throw err;
			}
			signedup = result.length;
			connection.release();
			if (err) {
				logger.error(err);
				throw err;
			}
		});
	});


	await wait(100);

	pool.getConnection(function(err, connection) {
		if (err) {
			logger.error(err);
			throw err;
		}
		try {
			if (signedup === 0) {
				const signup = 'INSERT INTO `inhouse_list` (userid, number, server) VALUES (' + userid + ', NULL, \'' + guildId + '\')';
				connection.query(signup, function(err, result) {
					if (err) {
						logger.error(err);
						throw err;
					}
					connection.release();
					if (err) {
						logger.error(err);
						throw err;
					}
					else {
						interaction.reply({ content: '내전 신청 완료!', fetchReply: true, ephemeral: true })
							.then(logger.info(member.tag + ' signed up for inhouse at ' + guild.name))
							.catch(logger.error);
					}
				});

			}
			else {
				const sql = 'DELETE FROM `inhouse_list` WHERE userid = \'' + userid + '\' AND server = \'' + guildId + '\'';

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
					else {
						interaction.reply({ content: '내전 신청을 취소하셨습니다!', fetchReply: true, ephemeral: true })
							.then(logger.info(member.tag + ' cancelled their signup at ' + guild.name))
							.catch(logger.error);
					}
				});

			}
		}
		catch (error) {
			logger.error(error);
		}

	});

});

client.on('interactionCreate', async interaction => {
	if (!interaction.isSelectMenu()) return;

	let info = '';
	if (interaction.values.length > 1) {
		for (let i = 0; i < interaction.values.length; i++) {
			if (i === interaction.values.length - 1) {
				info += interaction.values[i];
			}
			else {
				info += interaction.values[i] + ', ';
			}
		}
	}
	else {
		info = interaction.values[0];
	}

	const menuname = interaction.customId;
	const userid = interaction.user.id;
	const member = await interaction.guild.members.fetch(userid)
		.catch(logger.error);
	const checkifinfoexist = 'SELECT * FROM `player_info` WHERE userid = \'' + userid + '\'';
	let infoexists;

	pool.getConnection(function(err, connection) {
		if (err) {
			logger.error(err);
			throw err;
		}
		connection.query(checkifinfoexist, function(err, result) {
			if (err) {
				logger.error(err);
				throw err;
			}
			infoexists = result.length;
			connection.release();
			if (err) {
				logger.error(err);
				throw err;
			}
		});
	});

	await wait(100);

	try {
		if (infoexists === 0) {
			const signup = 'INSERT INTO `player_info` (userid, ' + menuname + ') VALUES (\'' + userid + '\', \'' + info + '\')';

			pool.getConnection(function(err, connection) {
				if (err) {
					logger.error(err);
					throw err;
				}
				connection.query(signup, function(err, result) {
					if (err) {
						logger.error(err);
						throw err;
					}

					interaction.reply({ content: '정보가 업데이트 되었습니다.', fetchReply: true, ephemeral: true })
						.then(logger.info('Updated player info for ' + member.tag))
						.catch(logger.error);
					connection.release();

					if (err) {
						logger.error(err);
						throw err;
					}
				});
			});
		}

		else {

			pool.getConnection(function(err, connection) {
				if (err) {
					logger.error(err);
					throw err;
				}
				const sql = 'UPDATE `player_info` SET ' + menuname + ' = \'' + info + '\' WHERE userid = \'' + userid + '\'';
				connection.query(sql, function(err, result) {
					if (err) {
						logger.error(err);
						throw err;
					}
					interaction.reply({ content: '정보가 업데이트 되었습니다.', fetchReply: true, ephemeral: true })
						.then(console.log('Updated player info for ' + member.tag))
						.catch(console.error);
					connection.release();
					if (err) {
						logger.error(err);
						throw err;
					}
				});
			});
		}
		logger.info('Updated player info for ' + interaction.user.tag + '.');
	}
	catch (error) {
		logger.error(error);
	}


});

// Login to Discord with your client's token
client.login(token);