const express = require('express');
const https = require('https')
var FormData = require('form-data');
var fs = require('fs');
const app = express();
const path = require('path')
const cookieParser = require('cookie-parser');
const axios = require('axios')
const cors = require('cors');
require('dotenv').config()

app.use(cookieParser());
app.use(express.json());
app.use(cors({ allowedHeaders: ['access_token', 'open_id'] }));

const port = process.env.PORT || 5000
const ip = process.env.IP || '0.0.0.0'
app.listen(port, ip, () => console.log(`Listening at : http://${ip}:${port}`))


const CLIENT_KEY = 'awybd3kl4d2abws8'
const CLIENT_SECRET = 'f2d14fdd32d559d6f89d569a3f00538a'
const SERVER_ENDPOINT_REDIRECT = 'https://tiktok.andrewsthilaire.com/redirect'

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

app.post('/post-video', (req, res) => {
    console.log(req.headers)
    const { listings } = req.body
    const { open_id, access_token } = req.headers

    console.log('Open Id', open_id, access_token)
    if (open_id) {

        const url_post_video = 'https://open-api.tiktok.com/share/video/upload/'
        if (listings && listings.length) {
            const videoName = "new-video.mp4"
            const file = fs.createWriteStream(videoName);
            const request = https.get(listings[0].video, function (response) {
                response.pipe(file);

                file.on("finish", () => {
                    file.close();
                    console.log("Download Completed");

                    var data = new FormData();
                    data.append('video', fs.createReadStream(videoName));

                    var config = {
                        method: 'post',
                        url: `${url_post_video}?open_id=${open_id}&access_token=${access_token}`,
                        headers: {
                            ...data.getHeaders()
                        },
                        data: data
                    };

                    axios(config)
                        .then(function (response) {
                            res.json(response.data);
                        })
                        .catch(function (error) {
                            res.send(error);
                        });

                });
            });
        }
    } else
        res.send('Unauthorized')

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

    axios.post(url_access_token).then(({ data }) => {
        console.log(data)
        res.json(data);
    });
})
