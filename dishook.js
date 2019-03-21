const Discord = require('discord.js');
const fs = require('fs');
const imgurUploader = require('imgur-uploader');
const Promise = require("bluebird");

const client = new Discord.Client();

var config
try {
	config = require('./config.json');
} catch (err) {
	console.log(err);
}

var ready = false;
var avatarCache = new Map();

var version = "0.0.1 alpha";

function showError(msg, err) {
	msg.channel.send("An error occured!\n```" + err.stack + "```\nPlease send a bug report");
}

function showHelp(msg) {
	var embeds = new Discord.MessageEmbed();
	
	embeds.setTitle("Dishook v" + version + " help");
	embeds.setDescription("Available commands");
	embeds.setFooter("Created by Reminy (AzureGem)#2169 <@107945385997156352>\nhttps://github.com/rreminy/Dishook");
	
	embeds.addField(config.prefix + "ping", "Perform a ping with the bot.");
	embeds.addField(config.prefix + "list", "List of available profiles.");
	embeds.addField(config.prefix + "help", "Help me!!");

	embeds.addField("\u200b", "Anything else prefixed with " + config.prefix + " will cause the bot to reply with the name after the " + config.prefix + " and deleting your original message. Profiles can be created inside the profiles directory to specify more friendly names and an optional avatars. Avatars are uploaded to imgur once they're first used and reused throughout the session of the bot (shutting / restarting the bot will cause it to reupload). Remember to setup your imgur API client ID in config.json if needed. Avatars must be in the avatar directory.");

	msg.channel.send(null, embeds);
}

function doPing(msg) {
	var start = process.hrtime();

	return msg.channel.send("Pong!")
	
	.then((msg) => {
		var end = process.hrtime(start);
		
		var elapsed = end[0] + (end[1] / 1000000)
		msg.edit("Pong! " + elapsed.toFixed(3) + "ms");
	});
}

function showList(msg) {
	msg.channel.send("TODO: function showList(msg)");
}

function resetCashe(msg) {
	avatarCache = new Map();
	msg.channel.send("Avatar Cache reset");
}

function doMessage(msg, argv) {
	var profile
	try {
		profile = require("./profile/" + argv[0].toString() + ".json"); /* TODO: Make a non-require() method of retreiving profiles (to avoid caching by require()) */
	} catch (err) {
		profile = new Object();
	}

	return new Promise((resolve, reject) => {
		resolve(msg.channel.guild.fetchWebhooks());
	})
	
	.then((webhooks) => {
		var webhook = webhooks.find((hook) => {return hook.name == config.hookname});
		if (webhook) return webhook;
		return msg.channel.createWebhook(config.hookname);
	})
	
	.then((webhook) => {
		if (webhook.channelID === msg.channel.id) return webhook;
		return webhook.edit({channel : msg.channel.id}, "Dishook: Changing Webhook Channel"); 
	})

	.then((webhook) => {
		if (profile.avatar) {
			var opts = new Object();
			if ((config.imgurClientID) && (config.imgurClientID.length > 0)) opts.token = "Client-ID " + config.imgurClientID;

			var upload;
			if (avatarCache.has(profile.avatar.toString())) {
				upload = avatarCache.get(profile.avatar.toString());
			} else {
				upload = imgurUploader(fs.readFileSync("./avatar/" + profile.avatar.toString()));
			}
		} else {
			upload = false
		}
		return Promise.all([webhook, upload]);
	})
	
	.then((vals) => {
		var webhook = vals[0];
		var upload = vals[1];
		
		if (upload) {
			avatarCache.set(profile.avatar.toString(), upload);
		}

		var opt = new Object();
		
		if (profile.name) {
			opt.username = profile.name.toString();
		} else {
			opt.username = argv[0];
		}
		if (upload) opt.avatarURL = upload.link;
		
		return webhook.send(msg.content.substring(config.prefix.length + argv[0].length + 1), opt);
	})
	
	.then(() => {
		msg.delete({reason: "Dishook: Message processed successfully"});
	})
	
	.catch((err) => {
		showError(msg, err);
	});

}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	ready = true;
});

client.on('message', msg => {
	if (msg.content.startsWith(config.prefix)) {
		if (!ready) {
			msg.reply("Not yet ready");
			return;
		}

		const args = msg.content.substring(2);
		const argv = args.split(' ');
		
		try {
			if (argv[0].toLowerCase() === 'ping') {
				doPing(msg);
			} else if (argv[0].toLowerCase() === 'help') {
				showHelp(msg);
			} else if (argv[0].toLowerCase() === 'list') {
				showList(msg);
			} else if (argv[0].toLowerCase() === 'reset') {
				resetCache(msg);
			} else {
				doMessage(msg, argv)
			}
		} catch (err) {
			showError(msg, err);
		}
	}
});

if ((config.token) && (config.token.length > 0)) {
	client.login(config.token);
} else {
	console.log("Discord Token missing, please set one up by creating a config.json file.");
}

