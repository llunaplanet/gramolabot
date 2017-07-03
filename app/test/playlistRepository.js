process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;

const PlaylistRepository = require('../src/lib/playlistRepository');
const Playlist = require('../src/lib/playlist')
const aws = require('aws-sdk');
const async = require('async');

// docker run -p 8000:8000 -d --name dynamodb peopleperhour/dynamodb

before(function(done) {

    aws.config.update({
        region: "any_region",
        endpoint: "http://localhost:8000"
    });

    playlistRepository = new PlaylistRepository(aws, 'tablePrefix');

    playlistRepository.deleteTable(function(err) {
        if(err) console.log(typeof(err));
        done();
    });

    playlist = new Playlist({
        slackTeamId: "some_team_id",
        name: "The playlist name",
        id: "some_playlist_id"
    });

})

describe('PlaylistRepository', function() {

    it('should create the repository table', function(done) {
        playlistRepository.createTable(function(err) {
            expect(err).to.be.null;
            done();
        });
    });

    it('should delete the repository table', function(done) {
        playlistRepository.deleteTable(function(err) {
            expect(err).to.be.null;
            done();
        });
    });

    context('map functions', function() {

        before(function() {
            DummyClass = function(keyA,keyB,keyC) {
                this.keyA = keyA;
                this.keyB = keyB;
                this.keyC = keyC;
            }
            DummyClass.prototype.fA = function(dummy){};
        });

        context('mapObjectToDoc', function() {

            it('should map only the object keys', function() {
                var obj = new DummyClass("A","B","C");
                var doc = playlistRepository.mapObjectToDoc(obj);

                expect(doc).to.deep.equal({
                    keyA: "A",
                    keyB: "B",
                    keyC: "C"
                });
            });

            it('should exclude one key', function() {
                var obj = new DummyClass("A","B","C");
                var doc = playlistRepository.mapObjectToDoc(obj, ['keyA']);

                expect(doc).to.deep.equal({
                    keyB: "B",
                    keyC: "C"
                });
            });

            it('should exclude two keys', function() {
                var obj = new DummyClass("A","B","C");
                var doc = playlistRepository.mapObjectToDoc(obj, ['keyA','keyC']);

                expect(doc).to.deep.equal({
                    keyB: "B"
                });
            });
        });
    });

    context('query by channel', function() {

        before(function(done){

            var slackTeamId = "any_team_id";
            playlists = [
                {name: "Playlist A", channel: "A"},
                {name: "Playlist B", channel: "A"},
                {name: "Playlist C", channel: "B"},
                {name: "Playlist D", channel: "C"},
            ];
            async.series(
                [
                    function(callback) {
                        playlistRepository.createTable(callback);
                    },
                    function(callback) {
                        async.each(
                            playlists,
                            function(item, callback) {
                                var playlist = new Playlist({
                                    slackTeamId: slackTeamId,
                                    slackChannelId: item.channel,
                                    type: 'channel',
                                    name: item.name
                                });
                                playlistRepository.addOrReplace(playlist, callback);
                            },
                            callback
                        );
                    }
                ],
                done
            );
        });

        after(function(done){
            playlistRepository.deleteTable(done);
        });

        it('should find 2 playlists for team_id and channel', function(done) {

            playlistRepository.findByTeamAndChannel("any_team_id", "A", function(err, playlists) {
                expect(err).to.be.null;
                expect(playlists).to.have.lengthOf(2);
                playlists.forEach(function(obj) {
                    expect(obj).instanceof(Playlist);
                });
                done();
            })
        });
    });

    context('having a playlist', function() {

        before(function(done){
            playlistRepository.createTable(done);
        });

        after(function(done){
            playlistRepository.deleteTable(done);
        });

        it('should add a new Playlist to the repository', function(done) {

            playlistRepository.addOrReplace(playlist, function(err) {
                expect(err).to.be.null;
                done();
            })
        });

        it('should find the added playlist', function(done) {

            playlistRepository.findBy("some_team_id", "some_playlist_id", function(err, obj) {
                expect(err).to.be.null;
                expect(obj).instanceof(Playlist);
                expect(obj).to.have.property('slackTeamId', 'some_team_id');
                done();
            })
        });

        it('should update the playlist', function(done) {

            playlist.slackUserId = "any_slack_user_id";
            playlist.name = "Other playlist name";
            playlistRepository.addOrReplace(playlist, function(err, obj) {
                expect(err).to.be.null;
                done();
            });
        });

        it('should find the updated Playlist', function(done) {

            playlistRepository.findBy("some_team_id", "some_playlist_id", function(err, obj) {
                expect(err).to.be.null;
                expect(obj).instanceof(Playlist);
                expect(obj).to.have.property('slackTeamId', 'some_team_id');
                expect(obj).to.have.property('slackUserId', 'any_slack_user_id');
                expect(obj).to.have.property('name', 'Other playlist name');
                done();
            })
        });

        it('should fail to find an unexistent playlist', function(done) {

            playlistRepository.findBy("some_team_id", "unknown_playlist_id", function(err, obj) {
                expect(err).to.be.null;
                expect(obj).to.be.null;
                done();
            });
        });

        it('should remove the playlist', function(done) {

            var playlist = new Playlist({
                id: "some_playlist_id",
                slackTeamId: "some_team_id"
            });

            playlistRepository.remove(playlist, function(err) {
                expect(err).to.be.null;
                done();
            });
        });

        it('should fail to find the deleted playlist', function(done) {

            playlistRepository.findBy("some_team_id", "some_playlist_id", function(err, obj) {
                expect(err).to.be.null;
                expect(obj).to.be.null;
                done();
            });
        });
    });

});
