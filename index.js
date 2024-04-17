const express = require('express');
const conn = require('./lib/mysql');
const { contentSanitize } = require('./lib/sanitize');

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


app.post('/telebe_yarat', async (req, res) => {
    const {ad, soyad} = req.body;
    const netice = await conn.query(`insert into Students (name, surname, created_at) values (?, ?, now())`, [ad, soyad]);

    res.redirect('/telebelerin_siyahisi');
});


app.get('/telebelerin_siyahisi', async (req, res) => {
    let {offset, axtar} = req.query;
    if (isNaN(offset)) {
        offset = 0;
    } else {
        offset = parseInt(offset);
    }

    let totalCount = 0;

    let novbetiHref = `<a href="?offset=${offset + 5}&axtar=${axtar || ''}">sonrakı &raquo;</a>`;
    let evvelkiHref = '';

    if (offset - 5 >= 0) {
        evvelkiHref = `<a href="?offset=${offset - 5}&axtar=${axtar || ''}">&laquo; evvelki</a>`;
    }

    const setrler = [];
    let parameterler = [];

    let shert = '';
    if (axtar?.trim()) {
        shert = `and (name = ? or surname = ?)`;
        parameterler = [axtar, axtar]
    }

    try {
        const sql1 = `select * from Students where 1=1 ${shert} order by id desc limit 5 offset ${offset}`;
        const sql2 = `select count(*) as say from Students where 1=1 ${shert}`;

        console.log("sql1:", sql1);
        console.log("sql2:", sql2);
         
        const [rows] = await conn.query(sql1, parameterler);
        const [counts] = await conn.query(sql2, parameterler);

        totalCount = counts[0].say;

        if (totalCount < offset + 5) {
            novbetiHref = '';
        }
    

        for(let row of rows) {
            setrler.push(`<tr>
                <td>${row.id}</td>
                <td>${contentSanitize(row.name)}</td>
                <td>${contentSanitize(row.surname)}</td>
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
        <h1>Total count: ${totalCount}</h1>
        <form id="form" method="POST" action="/telebe_yarat">
            <div style="margin: 20px auto;">
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

        <form method="GET" action="">
            <div style="margin: 20px auto">
                <div>
                    <label for="axtar">Axtar:</label>
                    <input type="text" id="axtar" name="axtar" value="${axtar || ''}" />
                    <button>Axtar</button>
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