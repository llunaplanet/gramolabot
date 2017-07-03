var Playlist = require('../../../lib/playlist')

// Cannot delete a playlist from the api :()
module.exports = [

    function(req, res, next) {
        req.playlist.name = "please delete me!"
        req.app.locals.playlistRepository
            .remove(req.playlist, function(err) {
                if(!err) res.response_text = "The playlist has been deleted succesfully";
                next(err);
            }
        );
    }
]
