process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;
const Playlist = require('../src/lib/playlist');
const async = require('async');
const uuid = require('uuid/v4');

describe('Tracks', function() {

    before(function(done) {
        playlist = new Playlist({name:"any_playlist"});
        done();
    });

    it('should create a new playlist', function(done) {
        playlist = new Playlist({name:"any_playlist"});
        expect(playlist.name).to.equal("any_playlist");
        done();
    });

    it('should add a new track', function(done) {
        var err = playlist.addTrack("user_id", "user_name", "track_id");
        expect(err).to.be.null;
        expect(playlist.tracks).to.have.lengthOf(1);
        expect(playlist.tracks[0].id).to.equal("track_id");
        expect(playlist.tracks[0].user_id).to.equal("user_id");
        expect(playlist.tracks[0].user_name).to.equal("user_name");
        done();
    });

    it('should fail to add the same track more than once', function(done) {
        var err = playlist.addTrack("user_id", "user_name", "track_id");
        expect(err).instanceof(Error);
        expect(err.message).to.equal("track-exists");
        done();
    });

    it('should fail to add a second track with the same user', function(done) {
        var err = playlist.addTrack("user_id", "user_name", "track_id_2");
        expect(err).instanceof(Error);
        expect(err.message).to.equal("user-track-limit");
        done();
    });

    it('should add a new track with the other user', function(done) {
        var err = playlist.addTrack("user_id_2", "user_name_2", "track_id_2");
        expect(err).to.be.null;
        expect(playlist.tracks).to.have.lengthOf(2);
        done();
    });

});
