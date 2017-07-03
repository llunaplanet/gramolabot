var Pagination = require('pagination');

module.exports = [

    function(req, res, next) {

        var attachments = [];
        var commands = [];
        var limit = 3;
        var offset = 1;

        if(req.commands[req.commands.length-1].indexOf("page:") != -1) {
            var page = req.commands.pop();
            var parts = page.split(":");
            offset = parseInt(parts[1]);
        }

        var text = req.commands.join(" ");

        if(text.indexOf(' - ') === -1) {
            var query = 'track:' + text;
        } else {
            var parts = text.split(' - ');
            var query = 'artist:' + parts[0].trim() + ' track:' + parts[1].trim();
        }

        console.log(query);

        // debug("Searching for: [%s]", query);

        req.app.locals.spotifyGateway.searchTracks(
            query,
            {
                limit: limit,
                offset: offset
            },
            function(err, tracks) {

                if(err) return next(err);

                var paginator = new Pagination.SearchPaginator({
                    current: offset,
                    rowsPerPage: limit,
                    totalResult: tracks.total
                });

                var pagination = paginator.getPaginationData();

                tracks.items.forEach(function(track){
                    attachments.push(track_to_attachment(track));
                });

                var pagination_actions = [];

                if(pagination.first) {
                    pagination_actions.push({
                        "name": "paginate_search",
                        "text": "<< first page",
                        "type": "button",
                        "value": text + " page:" + pagination.first
                    })
                }

                if(pagination.previous) {
                    pagination_actions.push({
                        "name": "paginate_search",
                        "text": "<< previous page ( " + pagination.previous + " )",
                        "type": "button",
                        "value": text + " page:" + pagination.previous
                    })
                }

                if(pagination.next) {
                    pagination_actions.push({
                        "name": "paginate_search",
                        "text": ">> next page ( " + pagination.next + " )",
                        "type": "button",
                        "value": text + " page:" + pagination.next
                    })
                }

                if(pagination.last) {
                    pagination_actions.push({
                        "name": "paginate_search",
                        "text": ">> last page ( " + pagination.last + " )",
                        "type": "button",
                        "value": text + " page:" + pagination.last
                    })
                }

                if(tracks.total > limit) {

                    attachments.push({
                        "pretext": "Use this buttons to move between search results:",
                        "callback_id": "unique_request",
                        "actions": pagination_actions
                    });
                }

                var from = pagination.fromResult;
                var to = pagination.toResult;
                var total = pagination.totalResult;

                res.response_object = {
                    "text": "Spotify search results for: ["+text+"] - Showing from " + from + " to " + to + " of " + total+ " tracks",
                    "attachments": attachments
                };

                next();
            }
        );
    }
]

var track_to_attachment = function(track) {

    // console.log(track);
    // console.log(track.artists);
    return {
        // "fallback": "Required plain-text summary of the attachment.",
        // "color": "#36a64f",
        // "pretext": "Optional text that appears above the attachment block",
        // "author_name": track.artists[0].name,
        // "author_link": track.artists[0].external_urls.spotify,
        "title": track.artists[0].name + " - " + track.name,
        "title_link": track.external_urls.spotify,
        "callback_id": "unique_request",
        "actions": [
            {
                "name": "add_track_to_playlist",
                "text": "Add to playlist",
                "type": "button",
                "value": track.uri
            }
        ]
        // "text": "Optional text that appears within the attachment",
        // "fields": [
        //     {
        //         "title": "Duration",
        //         "value": track.duration_ms,
        //         "short": false
        //     },
        //     {
        //         "title": "Preview",
        //         "value": track.preview_url,
        //         "short": true
        //     }
        // ],
        // "image_url": "http://my-website.com/path/to/image.jpg",
        // "thumb_url": "http://example.com/path/to/thumb.png",
        // "footer": "Slack API",
        // "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
        // "ts": 123456789
    }
}
