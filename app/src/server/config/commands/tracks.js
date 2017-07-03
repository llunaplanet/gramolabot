module.exports = {
    endpoint: "/api/teams/:team_id/channels/:channel_id/playlists",
    default: "help",
    commands: {
        add: {
            httpVerb: "POST",
            postFix: "/default/tracks",
            haveArgs: true,
            help: "playlist track add <spotify_track_uri>"
        },
        help: "Manages tracks"
    }
}
