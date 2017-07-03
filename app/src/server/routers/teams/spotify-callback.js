module.exports = [

    function(req, res, next) {

        req.app.locals.spotifyGateway
            .authorizeCallback(req.query, function(err) {
                if(!err) req.slackTeam.updateSpotifySettings(req.app.locals.spotifyGateway);
                next(err);
            }
        );
    },
    function(req, res, next) {

        req.app.locals.spotifyGateway
            .askWhoIAm(function(err, spotify_user_id) {
                if(!err) req.slackTeam.spotify.user = spotify_user_id;
                next(err);
            }
        );
    },
    function(req, res, next) {

        req.app.locals.teamRepository
            .addOrReplace(req.slackTeam, function(err) {
                if(err) return next(err);
                response_text = "The spotify integration is finished you can start managing Playlists!"
                res.json({
                    "text": response_text
                });
            }
        );
    }
];
