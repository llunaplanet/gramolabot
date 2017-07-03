var Playlist = require('../../../lib/playlist')

module.exports = [

    // Check if in the channel there is already a playlist with the same name
    function(req, res, next) {

        req.playlistName = req.commands.join(" ");

        if(!req.channelPlaylists.length) return next();
        var playlist = req.channelPlaylists.find(function(playlist) {
            if(playlist.generateSpotifyName() == req.playlistName) return true;
            return false;
        });
        if(playlist) return next(new Error('playlist-exists'));
        next();
    },
    // Create the new playlist
    function(req, res, next) {

        req.playlist = new Playlist({
            name: req.playlistName,
            slackTeamId: req.params.team_id,
            slackChannelId: req.params.channel_id,
            slackChannelName: req.body.channel_name,
            slackUserId: req.body.user_id,
            slackUserName: req.body.user_name,
            spotifyUserId: req.slackTeam.spotify.user
        });

        res.sync = true;
        next();
    }
]
