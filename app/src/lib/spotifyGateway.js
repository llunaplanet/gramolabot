const SpotifyWebApi = require('spotify-web-api-node');
const async = require('async');
const debug = require('debug')('spotifyGateway');

function SpotifyGateway(options) {

    this.api = new SpotifyWebApi({
        clientId : options.clientId,
        clientSecret : options.clientSecret,
        redirectUri : options.redirectUri
    });

    this.access_token = null;
    this.refresh_token = null;
    this.expires_in = null;
    this.user_id = null;

    this.tokens_refreshed = false;

};

SpotifyGateway.prototype.createAuthorizeURL = function(state) {

    var scopes = ['playlist-modify-public', 'playlist-modify-private'];
    return this.api.createAuthorizeURL(scopes, state);
}

SpotifyGateway.prototype.authorizeCallback = function(queryString, callback) {

    var _self = this;

    this.api.authorizationCodeGrant(queryString.code)
        .then(function(data) {
            debug('authorizationCodeGrant: ', data.body);
            _self.setTokens(data.body, true);
            callback(null);
        },
        function(err) {
            console.log('authorizationCodeGrant ERROR');
            console.log(err);
            callback(err);
        }
    );
};

SpotifyGateway.prototype.setTokens = function(data, updateExpiration) {

    debug('setTokens:', data);

    if(data) {

        if(updateExpiration) {
            var now = new Date().getTime();
            this.expires_in = now + (data.expires_in*1000);
            this.tokens_refreshed = true;
        }

        if(data.user) this.user_id = data.user;
        if(data.refresh_token) this.refresh_token = data.refresh_token;

        this.access_token = data.access_token;
    }

    this.api.setAccessToken(this.access_token);
    this.api.setRefreshToken(this.refresh_token);
};

SpotifyGateway.prototype.isTokenRefreshed = function() {
    if(!this.tokens_refreshed) return false;
    this.tokens_refreshed = false;
    return true;
}

SpotifyGateway.prototype.refreshTokenIfNeeded = function(callback) {
    var now = new Date().getTime();
    if(this.expires_in > now) return callback(null);
    this.refreshToken(callback);
}

SpotifyGateway.prototype.refreshToken = function(callback) {

    debug('refreshToken');
    var _self = this;

    this.api.refreshAccessToken()
        .then(function(data) {
            debug('Token refreshed');
            var updateExpiration = (data.body['refresh_token']) ? true : false;
            _self.setTokens(data.body, updateExpiration);
            callback(null);
        },
        function(err) {
            console.log(err);
            callback(err);
        }
    );
};

SpotifyGateway.prototype.createPlaylist = function(playlistName, callback) {

    debug('createPlaylist: %s', playlistName);
    var _self = this;
    this.refreshTokenIfNeeded(function(err) {
        if(err) return callback(err);

        _self.api.createPlaylist(_self.user_id, playlistName, { 'public' : false })
            .then(function(data) {
                console.log(data);
                callback(null, data);
            },
            function(err) {
                console.log('Some error creating the playlist')
                console.log(err);
                callback(err);
            }
        );
    })
}

SpotifyGateway.prototype.getPlaylist = function(playlist_id, callback) {

    debug('getPlaylist: %s', playlist_id);
    var _self = this;
    this.refreshTokenIfNeeded(function(err) {
        if(err) return callback(err);

        _self.api.getPlaylist(_self.user_id, playlist_id, {})
            .then(function(data) {
                callback(null, data);
            },
            function(err) {
                callback(err);
            }
        );
    })
}

SpotifyGateway.prototype.addTracksToPlaylist = function(playlist_id, tracks, callback) {
    var _self = this;
    this.api.addTracksToPlaylist(_self.user_id, playlist_id, tracks)
        .then(function(data) {
            callback(null, data);
        },
        function(err) {
            callback(err);
        }
    )
}

SpotifyGateway.prototype.searchTracks = function(query, options, callback) {

    options.limit = options.limit || 3;
    options.offset = options.offset || 1;

    var _self = this;
    this.refreshTokenIfNeeded(function(err) {
        if(err) return callback(err);
        _self.api.searchTracks(query, options)
            .then(function(data) {

                if (data.body.tracks.items === 0) return callback(null,[]);
                tracks = data.body.tracks;

                return callback(null,tracks);

            }, function(err) {
                console.log(err)
                callback(err);
            }
        );
    })
}

SpotifyGateway.prototype.askWhoIAm = function(callback) {

    this.api.getMe()
        .then(function(data) {
            debug('askWhoIAm: %s', data.body['id']);
            callback(null, data.body['id'])
        },
        function(err) {
            console.log(err);
            callback(err);
        }
    );
}

module.exports = SpotifyGateway;



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
