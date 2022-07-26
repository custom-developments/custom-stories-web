load(info => {
    const guilds = [];

    for (const guild of info.guilds.manage.concat(info.guilds.invite)) {
        guilds.push(`
            <a href="/overview.html#${guild.id}">
                <img src="${
                    guild.icon ? 
                    `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` :
                    `https://customrpg.xyz/assets/images/logo.png`
                }" width=100>
                
                ${guild.name} (click to ${info.guilds.manage.find(g => guild.id === g.id) ? 'manage' : 'invite'})
            </a>
        `);
    }

    document.getElementById('content').innerHTML = `
        <!-- Make sure to check if the user doesn't have an avatar too. -->
        <!-- <img src="https://cdn.discordapp.com/avatars/${info.user.id}/${info.user.avatar}"> -->

        <h3>Hey, ${escapeHTML(info.user.username)}!</h3>
        <p>Select a server you want to manage below.</p>
        <br>

        ${guilds.join('<br><br>')}
    `;
});