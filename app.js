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


const CLIENT_KEY = 'awfxi761fypcsblj'
const SERVER_ENDPOINT_REDIRECT = 'http://18.217.9.246:3000/redirect'

app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/index.html')))

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

app.post('post-video', (req, res) => {
    const { listings } = req.body
    if (listings && listings.length)
        fetch('https://open-api.tiktok.com/share/video/upload/')

})

app.get('/redirect', (req, res) => {

    res.send(req)
})
