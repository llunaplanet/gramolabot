// create
// add track
// load
//
//

// Sync existing playlist
// partitionKey = slackTeamId
// sortKey = uuid

const uuid = require('uuid/v4');
const async = require('async');
const debug = require('debug')('playlist');

function Playlist(options) {

    this.id = options.id || uuid();
    this.name = options.name;
    this.type = options.type || "channel";
    this.tracksPerUser = options.tracksPerUser || 1;

    this.slackTeamId = options.slackTeamId;
    this.slackChannelId = options.slackChannelId || null;
    this.slackChannelName = options.slackChannelName || null;

    this.slackUserId = options.slackUserId || null;
    this.slackUserName = options.slackUserName || null;

    this.spotifyUserId = options.spotifyUserId || null;
    this.spotifyPlaylistId = options.spotifyPlaylistId || null;  // Si tiene Id esta en sync

    this.spotifyPlaylistExternalUrl = null;
    this.spotifyPlaylistDataRaw = null;

    this.tracks = [];
};

Playlist.prototype.sync = function(spotifyGateway, callback) {
    // Check if spotify playlist exists
    var _self = this;
    debug('start sync')
    async.series(
        [
            function(callback) {
                if(_self.spotifyPlaylistId) return callback(null);
                spotifyGateway.createPlaylist(_self.generateSpotifyName(), function(err, data) {
                    if(err) return callback(err, null);
                    _self.spotifyPlaylistId = data.body.id;
                    _self.spotifyPlaylistExternalUrl = data.body.external_urls.spotify;
                    _self.spotifyPlaylistDataRaw = data.body;
                    callback(err);
                });
            },
            function(callback) {
                if(_self.spotifyPlaylistDataRaw) return callback(null);
                spotifyGateway.getPlaylist(_self.spotifyPlaylistId, function(err, data) {
                    if(!err) _self.spotifyPlaylistDataRaw = data.body;
                    callback(err);
                });
            },
            function(callback) {
                var tracksToAdd = [];
                var toRemove = [];

                _self.tracks.forEach(function(track) {
                    // Check if track in playlist
                    var exists = _self.spotifyPlaylistDataRaw.tracks.items.some(function(track_raw) {
                        console.log(track_raw);
                        return track.id == track_raw.id;
                    })

                    if(!exists) tracksToAdd.push(track.id);
                });

                debug('Tracks to Add:', tracksToAdd);

                if(!tracksToAdd.length) return callback(null);

                spotifyGateway.addTracksToPlaylist(
                    _self.spotifyPlaylistId,
                    tracksToAdd,
                    function(err, data) {
                        callback(err);
                    }
                );
            }
        ],
        function(err) {
            debug('end sync');
            callback(err);
        }
    );

    // Si tiene ID obtener el playlist y actualizar los tracks
    // Sino tiene ID, crear una nueva playlist
}

Playlist.prototype.checkIfTrackExists = function(track_id) {
    var exists = this.tracks.filter(function(item) {
        if(item.id == track_id) return true;
        return false;
    })
    return (exists.length) ? true : false;
}

Playlist.prototype.countUserTracks = function(user_id) {
    var tracks = this.tracks.filter(function(item) {
        if(item.user_id == user_id) return true;
        return false;
    })
    return tracks.length;
}

// Playlist.prototype.checkIfTrackExists = function(track_id) {
//     return this.tracks.filter(function(item) {
//         return item.id==track_id;
//     })
// }

Playlist.prototype.addTrack = function(user_id, user_name, track_id) {

    debug("addTrack: %s, %s, $s", user_id, user_name, track_id);

    if(this.checkIfTrackExists(track_id)) return new Error('track-exists');

    if(this.tracksPerUser > 0) {
        var userTracks = this.countUserTracks(user_id);
        if(userTracks >= this.tracksPerUser) {
            return new Error('user-track-limit');
        }
    }

    var track = {
        id: track_id,
        user_id: user_id,
        user_name: user_name,
        date: new Date().getTime()
    };

    this.tracks.push(track);
    return null;
}

Playlist.prototype.delete = function(spotifyGateway, callback) {

    var _self = this;
    spotifyGateway.createPlaylist(this.generateSpotifyName(), function(err, data) {
        if(err) return callback(err, null);
        _self.spotifyPlaylistId = data.body.id;
        _self.spotifyPlaylistExternalUrl = data.body.external_urls.spotify;
        callback(err, data);
    });
}

Playlist.prototype.generateSpotifyName = function() {
    return "#" + this.slackChannelName + " - " + this.name
}

module.exports = Playlist;


// spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE')
//     .then(function(data) {
//         console.log('Artist albums', data.body);
//     }, function(err) {
//         console.error(err);
//     });

    // var text = process.env.SLACK_OUTGOING === 'true' ? req.body.text.replace(req.body.trigger_word, '') : req.body.text;
    // if(text.indexOf(' - ') === -1) {
    //     var query = 'track:' + text;
    // } else {
    //     var pieces = text.split(' - ');
    //     var query = 'artist:' + pieces[0].trim() + ' track:' + pieces[1].trim();
    // }
    //
    // spotifyApi.searchTracks(query)
    //     .then(function(data) {
    //         var results = data.body.tracks.items;
    //         if (results.length === 0) {
    //           return slack(res, 'Could not find that track.');
    //         }
    //         var track = results[0];
    //         spotifyApi.addTracksToPlaylist(process.env.SPOTIFY_USERNAME, process.env.SPOTIFY_PLAYLIST_ID, ['spotify:track:' + track.id])
    //           .then(function(data) {
    //             var message = 'Track added' + (process.env.SLACK_OUTGOING === 'true' ? ' by *' + req.body.user_name + '*' : '') + ': *' + track.name + '* by *' + track.artists[0].name + '*'
    //             return slack(res, message);
    //           }, function(err) {
    //             return slack(res, err.message);
    //           });
    //       }, function(err) {
    //         return slack(res, err.message);
    //       });
    //   }, function(err) {
    //     return slack(res, 'Could not refresh access token. You probably need to re-authorize yourself from your app\'s homepage.');
    //   });
    //
