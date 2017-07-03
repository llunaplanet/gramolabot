
var express = require('express');
var bodyParser = require('body-parser');
var SlackTeamRepository = require('../lib/teamRepository')
var PlaylistRepository = require('../lib/playlistRepository')
var SpotifyGateway = require('../lib/spotifyGateway')
var aws = require('aws-sdk');

require('dotenv').config()

if(process.env.DYNAMODB_ENDPOINT && process.env.DYNAMODB_ENDPOINT!="") {
    aws.config.update({
        region: process.env.AWS_DEFAULT_REGION,
        endpoint: process.env.DYNAMODB_ENDPOINT
    });
}

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.locals.aws = aws;
app.locals.spotifyGateway = new SpotifyGateway({
    clientId : process.env.SPOTIFY_CLIENT_ID,
    clientSecret : process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri : process.env.ENDPOINT_HOST_URL + '/spotify/callback/'
});

app.locals.teamRepository = new SlackTeamRepository(aws, process.env.TABLE_PREFIX);
app.locals.playlistRepository = new PlaylistRepository(aws, process.env.TABLE_PREFIX);

app.locals.slackCommandsToEndpoints = require('./config/commands/index.js');

// Alias
// app.post('/slack/cmd/search', function(req, res, next) {
//     req.body.text = "playlist search " + req.body.text;
//     next();
// })
//
// app.post('/slack/cmd/playlist', function(req, res, next) {
//     req.body.text = "playlist " + req.body.text;
//     req.url = "/slack";
//     next();
// })

// app.post('/slack/actions', require('./slack/actionPreProcessor'));
app.post('/slack/commands', require('../lib/slack/commandPreProcessor'));

app.get('/spotify/callback', function(req, res, next) {
    var endpoint = ["api", "teams", req.query.state, "spotify-callback"];
    req.url = req.url.replace("/spotify/callback","/" + endpoint.join("/"));
    next();
});

app.use('/api', require('./routers/teams/router.js'));

app.use(function(req, res, next) {
    if(!res.response_text) return next()
    return res.json({"text":res.response_text});
});
// app.use('/api', require('./routers/playlists/router.js'));
// app.use('/', require('./routers/debug/router.js'));

// Error handling
app.use(function(err, req, res, next) {
    switch(err.message) {
        case 'no-command':
            response_text = "No command";
            return res.json({"text":response_text});
            break;
        case 'command-to-endpoint-failed':
            if(!res.response_text) res.response_text = "Tere is some problem with that command configuration";
            return res.json({"text":res.response_text});
            break;
        case 'admin-user-already-registered':
            response_text = "The admin user has been already initialized";
            return res.json({"text":response_text})
            break;
        case 'slack-team-not-found':
            response_text = "Plase intialize the jukebox by issuing the init command";
            return res.json({"text":response_text})
        break;
        case 'unauthorized':
            response_text = "Plase authorize the spotify APP by clickng on the following link:";
            response_text += process.env.ENDPOINT_HOST_URL + '/spotify/authorize?state=' + req.body.team_id
            return res.json({"text":response_text})
        break;
        default:
            console.error(err.stack);
            res.status(500).send('Something broke!');
            break;
    }
});

app.get('/init', [
    function(req,res, next){
        app.locals.teamRepository.createTable(next);
    },
    function(req,res, next){
        app.locals.playlistRepository.createTable(next);
    },
    function(req, res, next) {
        res.json({status:"Tables initialized"})
    }
])

module.exports = app;
