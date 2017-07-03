// var async = require('async')
var Playlists = require('./playlist.js')

function SlackTeam(slackTeamId) {

    this.settings = {
        one_playlist_per_channel: true
    };
    this.slack_team_id = slackTeamId;
    this.slack_admins = [];

    // authorized spotify users
    this.spotify = {
        user: null,
        access_token: null,
        refresh_token: null,
        expires_in: null
    };
};

SlackTeam.prototype.addAdminUser = function(userId) {
    this.slack_admins.push(userId);
}

SlackTeam.prototype.isSpotifyAuthorized = function() {
    if(this.spotify.user!=null && this.spotify.access_token!=null) return true;
    return false;
}

SlackTeam.prototype.updateSpotifySettings = function(spotifyGateway) {
    this.spotify = {
        user: spotifyGateway.user_id,
        access_token: spotifyGateway.access_token,
        refresh_token: spotifyGateway.refresh_token,
        expires_in: spotifyGateway.expires_in
    };
}

module.exports = SlackTeam;
