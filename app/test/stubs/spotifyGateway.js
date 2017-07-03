module.exports = function() {
    return {
        access_token: null,
        refresh_token: null,
        expires_in: null,
        spotify_user: null,
        createAuthorizeURL: function(a) {
            return a;
        },
        authorizeCallback: function(query, callback) {
            this.access_token = "any_access_token";
            this.refresh_token = "any_refresh_token";
            this.expires_in = "any_expiration";
            this.spotify_user = null;
            callback(null);
        },
        askWhoIAm: function(callback) {
            callback(null, "any_spotify_user")
        },
        createPlaylist: function(playlistName, callback) {
            callback(null, {
                body: {
                    id: playlistName,
                    external_urls: {
                        spotify: "any_external_url"
                    }
                }
            })
        },
        searchTracks: function(query, options, callback) {
            callback(null, {
                items: [
                    {
                        name: "Song A",
                        artists: [
                            {
                                name: "Artist A"
                            }
                        ],
                        external_urls: {
                            spotify: "any_external_url"
                        },
                        uri: "uria"
                    }
                ],
                total: 1
            })
        },
        setTokens: function() {},
        isTokenRefreshed: function() {
            return false;
        }
    }
}
