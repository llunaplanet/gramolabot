process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;
const commandPreProcessor = require('../src/lib/slack/commandPreProcessor');
var slackCommandsToEndpoints = require('../src/server/config/commands/index.js');

describe('Asking for help', function() {

    context('and there is a default action', function() {

        it('should ejecute the default action', function() {

            var req = generateSlackRequest('help');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("Use connect to bla bla bla");
            })
        });
    })
})

describe('Team command: ', function() {

    context('[team]', function() {

        it('should ejecute the default action', function() {

            var req = generateSlackRequest('team');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("Use connect to bla bla bla");
            })
        });
    })

    context('[team help]', function() {

        it('should return the help message', function() {

            var req = generateSlackRequest('team help');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("Use connect to bla bla bla");
            })
        });
    })

    context('[team connect]', function() {

        it('should translate to [/api/teams/:team_id/connect]', function() {

            var req = generateSlackRequest('team connect');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err).to.be.null;
                expect(req.method).to.equal("POST");
                expect(req.url).to.equal("/api/teams/team_id/connect");
            })
        });
    })

    context('[team connect help]', function() {

        it('should return the help message', function() {

            var req = generateSlackRequest('team connect help');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("Initializes the App connection");
            })
        });
    })

    context('[team authorize]', function() {

        it('should translate to [/api/teams/:team_id/authorize]', function() {

            var req = generateSlackRequest('team authorize');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err).to.be.null;
                expect(req.method).to.equal("POST");
                expect(req.url).to.equal("/api/teams/team_id/authorize");
            })
        });
    })

    context('[team authorize help]', function() {

        it('should return the help message', function() {

            var req = generateSlackRequest('team authorize help');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("Authorizes an spotify user");
            })
        });
    })

    context('[team reauthorize]', function() {

        it('should translate to [/api/teams/:team_id/reauthorize]', function() {

            var req = generateSlackRequest('team reauthorize');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err).to.be.null;
                expect(req.method).to.equal("POST");
                expect(req.url).to.equal("/api/teams/team_id/reauthorize");
            })
        });
    })

    context('[team reauthorize help]', function() {

        it('should return the help message', function() {

            var req = generateSlackRequest('team reauthorize help');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("Forzes a new spotify user syncronization");
            })
        });
    })

    context('[team debug]', function() {

        it('should translate to [/api/teams/:team_id/debug]', function() {

            var req = generateSlackRequest('team debug');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err).to.be.null;
                expect(req.method).to.equal("POST");
                expect(req.url).to.equal("/api/teams/team_id/debug");
            })
        });
    })

    context('[team debug help]', function() {

        it('should return the help message', function() {

            var req = generateSlackRequest('team debug help');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("Shows a pretiffied JSON representation of the Team");
            })
        });
    })

    context('[team unknown]', function() {

        it('should return the unknown message', function() {

            var req = generateSlackRequest('team unknown');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("Unknown command [unknown]");
            })
        });
    })
})

describe('Playlist command: ', function() {

    context('[playlist]', function() {

        it('should show the help message', function() {

            var req = generateSlackRequest('playlist');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("No help availble");
            })
        });

        it('should show the help message', function() {

            var req = generateSlackRequest('playlist help');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("No help availble");
            })
        });
    })

    context('[playlist create]', function() {

        it('should show insuficient arguments message + help', function() {

            var req = generateSlackRequest('playlist create');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("Some parameters are missing, ex:`playlist create <playlist name>`");
            })
        });

    })

    context('[playlist create help]', function() {

        it('should show the help message', function() {

            var req = generateSlackRequest('playlist create help');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("playlist create <playlist name>");
            })
        });
    })

    context('[playlist create any playlist name]', function() {

        it('should translate to [/api/teams/team_id/channels/channel_id/playlists]', function() {

            var req = generateSlackRequest('playlist create any playlist name');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err).to.be.null;
                expect(req.method).to.equal("POST");
                expect(req.url).to.equal("/api/teams/team_id/channels/channel_id/playlists");
                expect(req.commands).to.deep.equal(["any","playlist","name"]);
            })
        });
    })

    context('[playlist search]', function() {

        it('should show the help message', function() {

            var req = generateSlackRequest('playlist search');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("Some parameters are missing, ex:`playlist search <song>\nplaylist search <artist> - <song>`");
            })
        });
    })

    context('[playlist search help]', function() {

        it('should show the help message', function() {

            var req = generateSlackRequest('playlist search help');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("playlist search <song>\nplaylist search <artist> - <song>");
            })
        });
    })

    context('[playlist search song title]', function() {

        it('should translate to [/api/teams/team_id/channels/channel_id/playlists/search]', function() {

            var req = generateSlackRequest('playlist search any song title');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err).to.be.null;
                expect(req.method).to.equal("GET");
                expect(req.url).to.equal("/api/teams/team_id/channels/channel_id/playlists/search");
                expect(req.commands).to.deep.equal(["any","song","title"]);
            })
        });
    })

    context('[playlist delete]', function() {

        it('should translate to [/api/teams/team_id/channels/channel_id/playlists/default]', function() {

            var req = generateSlackRequest('playlist delete');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err).to.be.null;
                expect(req.method).to.equal("DELETE");
                expect(req.url).to.equal("/api/teams/team_id/channels/channel_id/playlists/default");
            })
        });
    })

    context('[playlist debug]', function() {

        it('should translate to [/api/teams/team_id/channels/channel_id/playlists/default/debug]', function() {

            var req = generateSlackRequest('playlist debug');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err).to.be.null;
                expect(req.method).to.equal("GET");
                expect(req.url).to.equal("/api/teams/team_id/channels/channel_id/playlists/default/debug");
            })
        });
    })
})

describe('Playlist tracks command: ', function() {

    context('[playlist track]', function() {

        it('should show the help message', function() {

            var req = generateSlackRequest('playlist track');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("No help availble");
            })
        });
    })

    context('[playlist track add]', function() {

        it('should show insuficient arguments message + help', function() {

            var req = generateSlackRequest('playlist track add');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("Some parameters are missing, ex:`playlist track add <spotify_track_uri>`");
            })
        });
    })

    context('[playlist track add help]', function() {

        it('should show the help message', function() {

            var req = generateSlackRequest('playlist track add help');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err.message).to.equal('command-to-endpoint-failed');
                expect(res.response_text).to.equal("playlist track add <spotify_track_uri>");
            })
        });
    })

    context('[playlist track add <spotify_track_uri>]', function() {

        it('should translate to [/api/teams/team_id/channels/channel_id/playlists/default/tracks]', function() {

            var req = generateSlackRequest('playlist track add <spotify_track_uri>');
            var res = {};

            commandPreProcessor(req, res, function(err) {
                expect(err).to.be.null;
                expect(req.method).to.equal("POST");
                expect(req.url).to.equal("/api/teams/team_id/channels/channel_id/playlists/default/tracks");
            })
        });
    })
})

function generateSlackRequest(command) {
    var req = {
        app: {
            locals: {
                slackCommandsToEndpoints: slackCommandsToEndpoints
            }
        },
        method: "POST",
        body: {
            text: command,
            team_id: "team_id",
            channel_id: "channel_id"
        },
        url: "/slack"
    }
    return req;
}
