var slackActionsToCommands = {
    add_track_to_playlist: {
        command: "playlist tracks add"
    },
    paginate_search: {
        command: "playlist search"
    }
}

function slackActionPreProcessor(req, res, next) {

    var debug = require('debug')('slackActionPreProcessor')

    if(!req.body.payload) {
        return res.json({
            "text": "No payload"
        });
    }

    var payload = {};
    try {
        payload = JSON.parse(req.body.payload);
    }
    catch(e) {
        return res.json({
            "text": "Payload error"
        });
    }

    debug("Payload:", payload);

    if(!payload.actions.length) {
        return res.json({
            "text": "No actions"
        });
    }

    var action = payload.actions[0];

    if(!slackActionsToCommands.hasOwnProperty(action.name)) {
        return res.json({"text": "Action ["+action.name+"] not found" });
    }

    var actionConfig = slackActionsToCommands[action.name];

    req.body.text = actionConfig.command + " " + action.value;
    req.body.team_id = payload.team.id;
    req.body.channel_id = payload.channel.id;
    req.body.user_id = payload.user.id;
    req.body.user_name = payload.user.name;

    req.url = "/slack";

    debug("%s - %s", req.method, req.url);

    next();

}
