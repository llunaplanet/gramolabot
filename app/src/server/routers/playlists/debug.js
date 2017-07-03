var Playlist = require('../../../lib/playlist')

module.exports = [

    function(req, res, next) {
        res.response_text = "```" + JSON.stringify(req.playlist, null, '\t') + "```"
        next();
    }
]
