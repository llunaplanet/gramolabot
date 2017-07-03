module.exports = function(req, res, next) {
    response_text = "Click in the following link to authorize a spotify user "
    response_text += req.app.locals.spotifyGateway.createAuthorizeURL(req.params.team_id);
    res.response_text = response_text;
    next();
}
