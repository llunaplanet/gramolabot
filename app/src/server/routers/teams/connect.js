// The first user that does the integration decides some things
const SlackTeam = require('../../../lib/team')

module.exports = [
    function(req, res, next) {

        if(!req.slackTeam) req.slackTeam = new SlackTeam(req.params.team_id);

        if(req.slackTeam.slack_admins.length != 0) {
            return next(new Error('admin-user-already-registered'))
        }

        req.slackTeam.addAdminUser(req.body.user_id);
        req.app.locals.teamRepository.addOrReplace(req.slackTeam, function(err) {
            if(!err) {
                res.response_text = "The app is succesfully initialized, you should authorize a spotify user"
            }
            return next(err);
        });
    }
]
