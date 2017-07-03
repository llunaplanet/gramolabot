module.exports = {

    team_id_param_processing: function(req, res, next, team_id) {
        req.app.locals.teamRepository.findBy(team_id, function(err, slackTeam) {
            if(err) return next(err);
            req.slackTeam = slackTeam;
            if(slackTeam) req.app.locals.spotifyGateway.setTokens(req.slackTeam.spotify);
            next();
        });
    },
    channel_id_param_processing: function(req, res, next, channel_id) {
        req.app.locals.playlistRepository
            .findByTeamAndChannel(
                req.params.team_id,
                req.params.channel_id,
                function(err, playlists) {
                    if(!err) req.channelPlaylists = playlists;
                    next(err);
                }
            );
    },
    playlist_id_param_processing: function(req, res, next, playlist_id) {

        if(playlist_id == "default") {
            req.selectedPlaylist = 0;
            req.playlist = req.channelPlaylists[req.selectedPlaylist];
        }
        next();
    }
}
