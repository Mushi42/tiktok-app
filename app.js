const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config()

app.use(cookieParser());
app.use(cors());

const port = process.env.PORT || 5000
const ip  = process.env.IP || '0.0.0.0'
app.listen(port, () => console.log(`Listening at : ${port}`))


const CLIENT_KEY = 'awybd3kl4d2abws8'
const SERVER_ENDPOINT_REDIRECT = 'https://www.andrewsthilaire.com/privacy-policy'

app.get('/oauth', (req, res) => {
    const csrfState = Math.random().toString(36).substring(2);
    res.cookie('csrfState', csrfState, { maxAge: 60000 });

    let url = 'https://www.tiktok.com/auth/authorize/';
    url += `?client_key=${CLIENT_KEY}`;
    url += '&scope=user.info.basic,video.list';
    url += '&response_type=code';
    url += `&redirect_uri=${SERVER_ENDPOINT_REDIRECT}`;
    url += '&state=' + csrfState;

    console.log('URL ', url)


    res.redirect(url);
})

app.post('postVideo', () => {
    res.send('Video Kit will be used here')
})

app.get('/redirect', (req, res) => {

    res.send(req)
})