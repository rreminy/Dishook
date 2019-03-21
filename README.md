# Dishook
This is a simple bot that allows you to talk in Discord as if you were others by the use of webhooks with optional profiles.

Usage
=====
- Rename config.sample.json to config.json and edit as needed. 
- Create profiles and avatars as needed inside the profile and avatar directory. Sample provided.
- Run install.sh (or run the commands inside manually) to install dependencies.
- Run start.sh (or node dishook.js).

Built in commands
=================
Replace !! with your prefix if you changed it.
- !!ping : Perform a ping with the bot.
- !!list : List of available profiles.
- !!help : Help me!!
- !!reset : Forgets which avatars have been uploaded to imgur.

Notes and Caveats
=================
- Profiles allows you to set a more readable name (with spaces if needed) and an Avatar.
- All chat replacements with this bot using the webhook will be very obvious as they have no discord profile and have the "Bot" tag.
- Doesn't support attachments (until implemented, see TODO).
- You may need to get an imgur API Client ID for avatars to work.

TODO
====
- A more correct way of handling this NodeJS project. (rather than using install.sh)
- A more broadly useable framework that can work on multiple servers with different profiles per server.
- A permission system to prevent unauthorized users from abusing it. 
- Attachment support, which would have to download all files then reupload. 
- Automatically detect changes to profile files and avatars.

Feel free to contribute. I originally created this to make an April Fools prank but I decided that I might as well share it.

Copyright (C) AzureGem 2019