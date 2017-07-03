module.exports = function(req, res, next) {
    delete req.slackTeam.spotifyGateway;
    res.response_text = "```" + JSON.stringify(req.slackTeam, null, '\t') + "```";
    next();
}
