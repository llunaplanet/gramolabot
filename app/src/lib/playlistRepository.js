const util = require('util');
const Repository = require('./repository.js')
const Playlist = require('./playlist.js')

module.exports = function PlaylistRepository(aws, tablePrefix) {

    this.repository = new Repository(aws, tablePrefix + "_playlists", "slackTeamId", "id");

    function findByTeamAndChannel(slackTeamId, slackChannelId, callback) {

        var _self = this;

        this.repository.query(
            {
                partitionKey: slackTeamId,
                filter: {
                    key: "slackChannelId",
                    value: slackChannelId,
                    condition: "="
                }
            },
            function(err, docs) {
                if(err || !docs.length) return callback(err, []);
                var playlists = [];
                docs.forEach(function(doc) {
                    var playlist = new Playlist({
                        slackTeamId: doc.slackTeamId
                    });
                    _self.mapDocToObject(playlist, doc);
                    playlists.push(playlist);
                });
                callback(null, playlists);
            }
        );
    };

    function findBy(slackTeamId, playlistId, callback) {

        var _self = this;

        this.repository.findBy(slackTeamId, playlistId, function(err, doc) {
            if(err || !doc) return callback(err, null);
            var playlist = new Playlist(doc.slackTeamId, doc.name, {});
            _self.mapDocToObject(playlist, doc);
            callback(null, playlist);
        });
    }

    function addOrReplace(playlist, callback) {

        var doc = this.mapObjectToDoc(playlist, ['spotifyPlaylistDataRaw']);
        this.repository.addOrReplace(doc, callback);
    }

    function remove(playlist, callback) {
        this.repository.removeBy(playlist.slackTeamId, playlist.id, callback);
    }

    return {
        mapObjectToDoc: this.repository.mapObjectToDoc,
        mapDocToObject: this.repository.mapDocToObject,
        repository: this.repository,
        createTable: this.repository.createTable,
        deleteTable: this.repository.deleteTable,
        Playlist: Playlist,
        findBy: findBy,
        findByTeamAndChannel: findByTeamAndChannel,
        addOrReplace: addOrReplace,
        remove: remove
    };

};
