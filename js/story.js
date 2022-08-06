let storyID;

if (window.location.hash.split('#').length <= 2) {
    guildID = window.location.hash.slice(1);
} else {
    storyID = encodeURIComponent(window.location.hash.split('#').slice(-1)[0]);
    guildID = window.location.hash.slice(1, -(++storyID.length));
}

load(async (user, guild) => {
    guildID = guild.info.id;

    document.getElementById('info').innerHTML = JSON.stringify({
        user,
        guild
    });

    document.getElementById('content').innerHTML = `
    <button onclick="window.location.href='server.html#${guild.info.id}'">Overview / Data</button> <button onclick="window.location.href='stories.html#${guildID}'">Stories</button>

        <h3>${guild.info.name} - ${storyID ? `Modify story part #${storyID}.` : 'Create story part.'}</h3>
        
        <p>
            Title: <input id="title"><br>
            Description:<br><textarea id="description"></textarea><br>
            Image: <input id="image">
        </p>

        <p>
            Color: <input type="color" id="color"><br>
            <input type="checkbox" id="use-default-color"> Use default.
        </p>

        <p>
            Choices: <button onclick="addChoice()">Add</button>
            <table id="choices">
                <tr>
                    <th>Type</th>
                    <th>Style</th>
                    <th>Label</th>
                    <th>Emoji</th>
                    <th>Goto</th>
                    <th>Remove</th>
                </tr>
            </table>
        </p>

        <p><button onclick="modifyStory()">${storyID ? 'Modify' : 'Create'}</button></p>
    `;

    document.getElementById('use-default-color').onchange = evt => {
        document.getElementById('color').disabled = evt.target.checked;
        if (evt.target.checked === true) document.getElementById('color').value = `#${guild.settings.defaultEmbedColor}`;
    }

    if (storyID) {
        const { story, error } = await getStory();

        if (error) {
            alert(error);
            return window.location.href = `stories.html#${guildID}`;
        }

        document.getElementById('title').value = story.title;
        document.getElementById('description').value = story.description;
        document.getElementById('image').value = story.image;

        if (story.color) {
            document.getElementById('color').value = `#${story.color}`;
        } else {
            document.getElementById('use-default-color').click(); // .checked = true
        }

        for (const choice of story.choices) {
            addChoice(choice);
        }
    }
}, guildID);

function addChoice(choice) {
    if (document.getElementById('choices').rows.length > 5) return;

    const row = document.getElementById('choices').insertRow(-1);
    
    const type = row.insertCell(0);
    const style = row.insertCell(1);
    const label = row.insertCell(2);
    const emoji = row.insertCell(3);
    const goto = row.insertCell(4);
    const remove = row.insertCell(5);

    type.innerHTML = `
        <select disabled>
            <option value="goto"${choice ? (choice.type === 'goto' ? ' selected' : '') : ''}>Goto</option>
        </select>
    `;

    style.innerHTML = `
        <select>
            <option value="1"${choice ? (choice.style === 1 ? ' selected' : '') : ''}>Primary</option>
            <option value="2"${choice ? (choice.style === 2 ? ' selected' : '') : ''}>Secondary</option>
            <option value="3"${choice ? (choice.style === 3 ? ' selected' : '') : ''}>Success</option>
            <option value="4"${choice ? (choice.style === 4 ? ' selected' : '') : ''}>Danger</option>
        </select>
    `;

    label.innerHTML = `
        <input${choice && choice.label ? ` value="${escapeHTML(choice.label)}"` : ''}>
    `;

    emoji.innerHTML = `
        <input${choice && choice.emoji ? ` value="${escapeHTML(choice.emoji.name)}"` : ''}>
    `
    
    goto.innerHTML = `
        <input type="number"${choice ? ` value="${choice.goto}"` : ''}>
    `

    remove.innerHTML = `
        <button onclick="deleteChoice(this)">X</button>
    `
}

function deleteChoice(r) {
    document.getElementById('choices').deleteRow(r.parentNode.parentNode.rowIndex);
}

async function getStory() {
    const storiesReq = await fetch(`http://localhost:8001/guild/${guildID}/stories/${storyID}`, {
        credentials: 'include'
    });
    
    return await storiesReq.json();
}

async function modifyStory() {
    const choices = [];

    for (const row of [ ...document.getElementById('choices').rows ].slice(1)) {
        choices.push({
            type: row.cells[0].getElementsByTagName('select')[0].value,
            style: Number(row.cells[1].getElementsByTagName('select')[0].value),
            label: row.cells[2].getElementsByTagName('input')[0].value,
            emoji: row.cells[3].getElementsByTagName('input')[0].value.length ? {
                name: row.cells[3].getElementsByTagName('input')[0].value
            } : undefined,
            goto: Number(row.cells[4].getElementsByTagName('input')[0].value)
        })
    }

    const res = await fetch(`http://localhost:8001/guild/797095798507700264/stories/${storyID || ''}`, {
        credentials: 'include',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            image: document.getElementById('image').value,
            color: document.getElementById('use-default-color').checked ? null : document.getElementById('color').value.slice(1),
            choices
        })
    });

    const response = await res.json();
    if (response.errors) return alert(JSON.stringify(response.errors));

    window.location.href = `stories.html#${guildID}`;
}