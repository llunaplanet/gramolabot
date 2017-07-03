var Playlist = require('../../../lib/playlist')

module.exports = [

    function(req, res, next) {

        res.sync = true;
        res.response_text = "The playlist has been *synced* succesfully"
        next();
    }
]
