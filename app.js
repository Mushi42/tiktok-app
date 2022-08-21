const express = require('express');
const app = express();
const path = require('path')
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config()

app.use(cookieParser());
app.use(cors());

const port = process.env.PORT || 5000
const ip = process.env.IP || '0.0.0.0'
app.listen(port, ip, () => console.log(`Listening at : http://${ip}:${port}`))


const CLIENT_KEY = 'awybd3kl4d2abws8'
const CLIENT_SECRET = 'f2d14fdd32d559d6f89d569a3f00538a'
const SERVER_ENDPOINT_REDIRECT = 'https://tiktok.andrewsthilaire.com'

app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/index.html')))

app.get('/oauth', (req, res) => {
    const csrfState = Math.random().toString(36).substring(2);
    res.cookie('csrfState', csrfState, { maxAge: 60000 });

    let url = 'https://www.tiktok.com/auth/authorize/';
    url += `?client_key=${CLIENT_KEY}`;
    url += '&scope=video.upload';
    url += '&response_type=code';
    url += `&redirect_uri=${SERVER_ENDPOINT_REDIRECT}`;
    url += '&state=' + csrfState;

    console.log('URL ', url)


    res.redirect(url);
})

app.post('post-video', (req, res) => {
    const { listings } = req.body
    const url_post_video = 'https://open-api.tiktok.com/share/video/upload/'
    if (listings && listings.length) {
        const payload = {

        }
        fetch(url_post_video, { method: 'post', body: payload })
            .then(res => res.json())
            .then(json => {
                res.send(json);
            });
    }

})

app.get('/refresh_token/', (req, res) => {
    const refresh_token = req.query.refresh_token;

    let url_refresh_token = 'https://open-api.tiktok.com/oauth/refresh_token/';
    url_refresh_token += '?client_key=' + CLIENT_KEY;
    url_refresh_token += '&grant_type=refresh_token';
    url_refresh_token += '&refresh_token=' + refresh_token;

    fetch(url_refresh_token, { method: 'post' })
        .then(res => res.json())
        .then(json => {
            res.send(json);
        });
})

app.get('/redirect', (req, res) => {

    const { code, state } = req.query;
    const { csrfState } = req.cookies;

    if (state !== csrfState) {
        res.status(422).send('Invalid state');
        return;
    }

    let url_access_token = 'https://open-api.tiktok.com/oauth/access_token/';
    url_access_token += '?client_key=' + CLIENT_KEY;
    url_access_token += '&client_secret=' + CLIENT_SECRET;
    url_access_token += '&code=' + code;
    url_access_token += '&grant_type=authorization_code';

    fetch(url_access_token, { method: 'post' })
        .then(res => res.json())
        .then(json => {
            res.send(json);
        });
})
