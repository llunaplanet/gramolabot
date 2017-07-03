var Playlist = require('../../../lib/playlist')
const async = require('async')

// Cannot delete a playlist from the api,
module.exports = [

    // Create the new playlist
    function(req, res, next) {

        async.eachSeries(
            req.channelPlaylists,
            function(playlist, callback) {
                playlist.name = "please delete me!"
            },
            function(err) {
                next(err);
            }
        )

        req.playlist.sync(req.app.locals.spotifyGateway, function(err) {
            if(err) return next(err);

            req.app.locals.playlistRepository
                .addOrReplace(req.playlist, function(err) {
                    if(err) return next(err);
                    res.json({
                        "text": "The playlist has been created succesfully"
                    });
                }
            );
        });
    }
]
