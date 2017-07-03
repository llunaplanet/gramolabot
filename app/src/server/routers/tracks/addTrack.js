var Playlist = require('../../../lib/playlist')

module.exports = [

    function(req, res, next) {
        var track_id = req.commands.pop();
        var err = req.playlist.addTrack(req.body.user_id, req.body.user_name, track_id)
        if(!err) {
            res.sync = true;
            res.response_text = "The playlist has been created succesfully"
        }
        next(err);
    }
]
