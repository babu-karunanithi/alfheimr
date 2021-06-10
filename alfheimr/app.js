const cors = require('cors');
const bodyParser = require('body-parser');
const api = require('./routes/api');
const express = require('express');
const port = 3000,
app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/api', api);
app.use(cors());


app.use((_req, _res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, _req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));