const express = require('express');
const conn = require('./lib/mysql');

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


app.post('/telebe_yarat', async (req, res) => {
    const {ad, soyad} = req.body;
    const netice = await conn.query(`insert into Students (name, surname, created_at) values ('${ad}', '${soyad}', now())`);

    res.redirect('/telebelerin_siyahisi');
});


app.get('/telebelerin_siyahisi', async (req, res) => {
    let {offset} = req.query;
    if (isNaN(offset)) {
        offset = 0;
    } else {
        offset = parseInt(offset);
    }

    let totalCount = 0;

    let novbetiHref = `<a href="?offset=${offset + 5}">sonrakı &raquo;</a>`;
    let evvelkiHref = '';

    if (offset - 5 >= 0) {
        evvelkiHref = `<a href="?offset=${offset - 5}">&laquo; evvelki</a>`;
    }

    const setrler = [];

    try {
        const [rows] = await conn.query(`select * from Students limit 5 offset ${offset}`);
        const [counts] = await conn.query(`select count(*) as say from Students`);

        totalCount = counts[0].say;

        if (totalCount < offset + 5) {
            novbetiHref = '';
        }
    

        for(let row of rows) {
            setrler.push(`<tr>
                <td>${row.id}</td>
                <td>${row.name}</td>
                <td>${row.surname}</td>
                <td>${row.created_at.getHours()}:${row.created_at.getMinutes()}</td>
            </tr>`);
        }
    } catch (err) {
        return res.redirect('/error');
    }

    res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div>
        <form id="form" method="POST" action="/telebe_yarat">
            <div>
                <div>
                    <label for="ad">Ad:</label>
                    <input type="text" id="ad" name="ad" />
                </div>
                <div>
                    <label for="soyad">Soyad:</label>
                    <input type="text" id="soyad" name="soyad" />
                </div>
                <div>
                    <button>Gonder</button>
                </div>
            </div>
        </form>
    </div>
    <table border="1" cellpadding="10" cellspacing="0">
        <thead>
            <tr>
                <th>#</th>
                <th>Ad</th>
                <th>Soyad</th>
                <th>Yaradilma tarixi</th>
            </tr>
        </thead>
        <tbody>
            ${setrler.join('')}
        </tbody>
    </table>
    <div>
        
        ${evvelkiHref} ${novbetiHref}
    </div>
</body>
</html>
    `);
});


app.listen(5500, () => {
    console.log("serverimiz ishe dushdu");
});