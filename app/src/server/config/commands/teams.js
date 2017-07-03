module.exports = {
    endpoint: "/api/teams/:team_id",
    default: "help",
    commands: {
        connect: {
            postFix: "/connect",
            help: "Initializes the App connection"
        },
        authorize: {
            postFix: "/authorize",
            help: "Authorizes an spotify user"
        },
        reauthorize: {
            postFix: "/reauthorize",
            help: "Forzes a new spotify user syncronization"
        },
        debug: {
            postFix: "/debug",
            help: "Shows a pretiffied JSON representation of the Team"
        },
        help: "Manages app initialization"
    }
}
