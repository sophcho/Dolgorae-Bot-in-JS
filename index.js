// Require the necessary discord.js classes
const Discord = require('discord.js');
const { token } = require('./config.json');
const mysql = require('mysql');
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const wait = require('util').promisify(setTimeout);


const con = mysql.createConnection({
	host: 'na05-sql.pebblehost.com',
	user: 'customer_234512_dolgoraebot',
	password: '6!GxA7D6P09vmDLBTeqr',
	database: 'customer_234512_dolgoraebot',
});

con.connect(function(err) {
	if (err) throw err;
	console.log('Connected!');
});

module.exports = { con };


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
	console.log('added');
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
	client.user.setPresence({ activities: [{ name: 'v0.1.0' }], status: 'online' });
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
			try {
				con.query(sql, function(err, result) {
					if (err) throw err;
					console.log('1 record added');
				});
			}
			catch (error) {
				console.error(error);
			}
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
			try {
				con.query(sql, function(err, result) {
					if (err) throw err;
					console.log('Number of records deleted: ' + result.affectedRows);
				});
			}
			catch (error) {
				console.error(error);
			}

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
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;

	const userid = interaction.user.id;
	const serverid = interaction.guildId;
	const checkifsignedup = 'SELECT * FROM `inhouse_list` WHERE userid = \'' + userid + '\' AND server = \'' + serverid + '\'';

	let signedup;
	con.query(checkifsignedup, function(err, result) {
		if (err) throw err;
		signedup = result.length;
	});

	await wait(100);

	try {
		if (signedup === 0) {
			const signup = 'INSERT INTO `inhouse_list` (userid, number, server) VALUES (' + userid + ', NULL, \'' + serverid + '\')';
			con.query(signup, function(err, result) {
				if (err) throw err;
				console.log('1 record added');
			});

			interaction.reply({ content: '내전 신청 완료!', fetchReply: true, ephemeral: true })
				.then(console.log('Reply sent with'))
				.catch(console.error);
		}
		else {
			const sql = 'DELETE FROM `inhouse_list` WHERE userid = \'' + userid + '\' AND server = \'' + serverid + '\'';

			con.query(sql, function(err, result) {
				if (err) throw err;
				console.log('Number of records deleted: ' + result.affectedRows);
			});

			interaction.reply({ content: '내전 신청을 취소하셨습니다!', fetchReply: true, ephemeral: true })
				.then(console.log('Reply sent with'))
				.catch(console.error);
		}
	}
	catch (error) {
		console.error(error);
	}


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
	const checkifinfoexist = 'SELECT * FROM `player_info` WHERE userid = \'' + userid + '\'';

	let infoexists;
	con.query(checkifinfoexist, function(err, result) {
		if (err) throw err;
		infoexists = result.length;
	});

	await wait(100);

	try {
		if (infoexists === 0) {
			const signup = 'INSERT INTO `player_info` (userid, ' + menuname + ') VALUES (\'' + userid + '\', \'' + info + '\')';
			con.query(signup, function(err, result) {
				if (err) throw err;
				console.log('1 record added');
			});

			interaction.reply({ content: '정보가 업데이트 되었습니다.', fetchReply: true, ephemeral: true })
				.then(console.log('Updated league tier for a user'))
				.catch(console.error);
		}
		else {
			const sql = 'UPDATE `player_info` SET ' + menuname + ' = \'' + info + '\' WHERE userid = \'' + userid + '\'';

			con.query(sql, function(err, result) {
				if (err) throw err;
				console.log('Record updated');
			});

			interaction.reply({ content: '정보가 업데이트 되었습니다.', fetchReply: true, ephemeral: true })
				.then(console.log('Updated league tier for a user'))
				.catch(console.error);
		}
	}
	catch (error) {
		console.error(error);
	}

});

// Login to Discord with your client's token
client.login(token);
