module.exports = {
    endpoint: "/api/teams/:team_id/channels/:channel_id/playlists",
    default: "help",
    commands: {
        create: {
            httpVerb: "POST",
            haveArgs: true,
            help: "playlist create <playlist name>"
        },
        search: {
            httpVerb: "GET",
            haveArgs: true,
            postFix: "/search",
            help: "playlist search <song>\nplaylist search <artist> - <song>"
        },
        list: {
            httpVerb: "GET",
            help: ""
        },
        delete: {
            httpVerb: "DELETE",
            postFix: "/default"
        },
        deleteAll: {
            httpVerb: "DELETE",
            help: ""
        },
        debug: {
            httpVerb: "GET",
            postFix: "/default/debug"
        },
        sync: {
            httpVerb: "GET",
            postFix: "/default/sync"
        },
        track: require('./tracks.js'),
        help: "Manages playlists"
    }
}
