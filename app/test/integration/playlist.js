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
    app.locals.playlistRepository.deleteTable(function(err) {
        app.locals.playlistRepository.createTable(function(err) {
            done(err);
        });
    });
});

describe('Playlist management', function() {

    describe('/teams/:team_id/channels/:channel_id/playlists', function() {

        it('Creates a new playlist', function(done) {
            chai.request(app)
                .post('/slack')
                .send({
                    text: 'playlist create The awesome playlist',
                    team_id: 'any_team_id',
                    user_id: 'any_user_id',
                    channel_id: 'any_channel_id',
                    channel_name: 'any_channel_name'
                })
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.deep.equal({
                        text: "The playlist has been created succesfully"
                    })
                    done();
                }
            );
        });

        // it('Shows the channel playlists', function(done) {});
        // it('Shows the channel playlists', function(done) {});

    });

    context('Search', function() {

        describe('/teams/:team_id/channels/:channel_id/playlists/search', function() {

            it('Returns the first 3 results', function(done) {
                chai.request(app)
                    .post('/slack')
                    .send({
                        text: 'playlist search any_song',
                        team_id: 'any_team_id',
                        user_id: 'any_user_id',
                        channel_id: 'any_channel_id',
                        channel_name: 'any_channel_name'
                    })
                    .end(function(err, res) {
                        expect(res).to.have.status(200);
                        expect(res).to.be.json;
                        expect(res.body.attachments[0].title).to.equal("Artist A - Song A");
                        done();
                    }
                );
            });
        });
    })
});
