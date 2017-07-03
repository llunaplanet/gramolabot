var express = require('express');
var router = express.Router();
var routerHelpers = require('../helpers')

router.param('team_id', routerHelpers.team_id_param_processing);
router.param('channel_id', routerHelpers.channel_id_param_processing);
router.param('playlist_id', routerHelpers.playlist_id_param_processing);

// Tracks
router.post("/teams/:team_id/channels/:channel_id/playlists/:playlist_id/tracks", require('./addTrack.js'));
router.get('/teams/:team_id/channels/:channel_id/playlists/:playlist_id/debug', require('./debug.js'));
router.get('/teams/:team_id/channels/:channel_id/playlists/:playlist_id/sync', require('./sync.js'));
router.delete('/teams/:team_id/channels/:channel_id/playlists/:playlist_id', require('./delete.js'));

// Playlists
router.get('/teams/:team_id/channels/:channel_id/playlists/search', require('./search.js'));
router.post('/teams/:team_id/channels/:channel_id/playlists', require('./create.js'));
router.get('/teams/:team_id/channels/:channel_id/playlists', require('./list.js'));
router.delete('/teams/:team_id/channels/:channel_id/playlists', require('./deleteAll.js'));

// Process the res.response_text
router.use(function(req, res, next) {
    if(!res.sync) return next();
    req.playlist.sync(req.app.locals.spotifyGateway, function(err) {
        if(err) return next(err);

        req.app.locals.playlistRepository
            .addOrReplace(req.playlist, function(err) {
                if(!err) res.sync = true;
                next(err);
            }
        );
    });
});

// Process the res.response_text
router.use(function(req, res, next) {
    if(res.response_text)
        res.json({
            "text": response_text
        });
    }
    else {
        res.json(res.response_object);
    }
});

router.use(function(err, req, res, next) {

    if(!req.app.locals.spotifyGateway.isTokenRefreshed()) return next(err);
    req.slackTeam.updateSpotifySettings(req.app.locals.spotifyGateway);
    req.app.locals.teamRepository.addOrReplace(req.slackTeam,
        function(_err) {
            next(err);
        }
    );
});

router.use(function(err, req, res, next) {

    switch(err.message) {
        case 'user-track-limit':
            response_text = "You already have a song added to this playlist";
            return res.json({"text":response_text})
            break;
        case 'track-exists':
            response_text = "This song is already on the playlist";
            return res.json({"text":response_text})
            break;
        default:
            console.error(err.stack);
            res.status(500).send('Something broke!');
            break;
    }

});

module.exports = router;
