process.env.NODE_ENV = 'test';
process.env.DYNAMODB_ENDPOINT = "http://localhost:8000"
process.env.AWS_DEFAULT_REGION = "any_region"
process.env.TABLE_PREFIX = "tablePrefix"

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

// chai.use(function (chai, utils) {
// 	var Assertion = chai.Assertion;
// 	Assertion.addMethod('hello', function (type) {
// 		var obj = this._obj;
// 		// first, our instanceof check, shortcut
// 		new Assertion(this._obj).to.be.instanceof(Model);
// 		// second, our type check
// 		this.assert(
// 			obj._type === type
// 			, "expected #{this} to be of type #{exp} but got #{act}"
// 			, "expected #{this} to not be of type #{act}"
// 			, type        // expected
// 			, obj._type   // actual
// 			);
// 	});
// });

mockery = require('mockery')

mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true
});

mockery.registerMock('../lib/spotifyGateway', require('../stubs/spotifyGateway'));

const app = require('../../src/server/app.js');

before(function(done) {
    // Init Tables
    app.locals.teamRepository.deleteTable(function(err){
        app.locals.teamRepository.createTable(function(err) {
            done(err);
        });
    });
});

before(function(done) {
    // Init Tables
    app.locals.playlistRepository.deleteTable(function(err){
        app.locals.playlistRepository.createTable(function(err) {
            done(err);
        });
    });
});

describe('Slack Routes', function() {

    describe('/slack/commands', function() {
        it('returns `generated help`', function(done) {
            chai.request(app)
                .post('/slack/commands')
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.deep.equal({text: "team: Manages app initialization\nplaylist: Manages playlists" })
                    done();
                }
            );
        });
    });

    describe('/api/teams/:team_id/connect', function() {
        it('initializes an slack team', function(done) {
            chai.request(app)
                .post('/slack/commands')
                .send({text: 'team connect', team_id: 'any_team_id', user_id: 'any_user_id'})
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.deep.equal({
                        text: "The app is succesfully initialized, you should authorize a spotify user"
                    });
                    done();
                }
            );
        });

        it('fails to re-initialize an slack team', function(done) {
            chai.request(app)
                .post('/slack/commands')
                .send({text: 'team connect', team_id: 'any_team_id', user_id: 'any_user_id'})
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.deep.equal({
                        text: "The admin user has been already initialized"
                    });
                    done();
                }
            );
        });
    });

    describe('/api/teams/:team_id/authorize', function() {

        before(function(){
            callback_link = app.locals.spotifyGateway.createAuthorizeURL('any_team_id');
        });

        it('generates spotify authorization link', function(done) {
            chai.request(app)
                .post('/slack/commands')
                .send({text: 'team authorize', team_id: 'any_team_id', user_id: 'any_user_id'})
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.deep.equal({
                        text: "Click in the following link to authorize a spotify user " + callback_link
                    })
                    done();
                }
            );
        });

        it('responds with already authorized message', function(done) {

            // Fake slackTeam spotify user authorization
            app.locals.teamRepository.findBy("any_team_id", function(err, slackTeam) {
                slackTeam.spotify.user = "any_spotify_user";
                slackTeam.spotify.access_token = "any_access_token";
                app.locals.teamRepository.addOrReplace(slackTeam, function(err) {

                    chai.request(app)
                        .post('/slack/commands')
                        .send({text: 'team authorize', team_id: 'any_team_id', user_id: 'any_user_id'})
                        .end(function(err, res) {
                            expect(res).to.have.status(200);
                            expect(res).to.be.json;
                            expect(res.body).to.deep.equal({
                                text: "The app is succesfully authorized for spotify user: [any_spotify_user]"
                            })
                            done();
                        }
                    );
                });
            });
        });
    });

    describe('/api/teams/:team_id/reauthorize', function() {

        before(function(){
            callback_link = app.locals.spotifyGateway.createAuthorizeURL('any_team_id');
        });

        it('re-generates spotify authorization link', function(done) {
            chai.request(app)
                .post('/slack/commands')
                .send({text: 'team reauthorize', team_id: 'any_team_id', user_id: 'any_user_id'})
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.deep.equal({
                        text: "Click in the following link to authorize a spotify user " + callback_link
                    })
                    done();
                }
            );
        });
    });

    describe('/spotify/callback/', function() {

        it('authorizes an spotify user_id into a SlackTeam', function(done) {
            chai.request(app)
                .get('/spotify/callback/')
                .query({
                    scope: 'playlist-modify-public playlist-modify-private',
                    state: 'any_team_id',
                })
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.deep.equal({
                        text: "The spotify integration is finished you can start managing Playlists!"
                    })
                    done();
                }
            );
        });
    });

});
