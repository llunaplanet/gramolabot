module.exports = [
    function(req, res, next) {
        var response_text = "";
        req.channelPlaylists.forEach(function(playlist){
            response_text += "```" + JSON.stringify(playlist, null, '\t') + "```\n";
        });
        res.response_text = response_text;
        next();
    }
]
