module.exports = slackCommandPreProcessor = function(req, res, next) {

    var slackCommandsToEndpoints = req.app.locals.slackCommandsToEndpoints;

    var debug = require('debug')('slackCommandPreProcessor');
    debug("body: ", req.body);

    req.commands = [];
    var text = req.body.text || req.query.text;
    if(text) {
        req.commands = text.split(" ");
    }

    convertCommandToEndpoint(req, res, slackCommandsToEndpoints);
    if(res.response_text) {
        return next(new Error('command-to-endpoint-failed'));
    }

    req.url = req.url
        .replace(":team_id", req.body.team_id)
        .replace(":channel_id", req.body.channel_id)

    debug("%s - %s", req.method, req.url);

    next(null);

}

var convertCommandToEndpoint = function(req, res, commandToEndpointsConfig) {

    var command = (req.commands.length) ? req.commands.shift() : "none";
    var commandConfig = null;
    // console.log(command);

    // Default check
    if(command == "none" && commandToEndpointsConfig.default) {
        command = commandToEndpointsConfig.default;
    }

    // Help check
    if(command == "help") {
        res.response_text = getHelpText(commandToEndpointsConfig);
        return;
    }

    // Hay comando?
    if(commandToEndpointsConfig.hasOwnProperty(command)) {
        commandConfig = commandToEndpointsConfig[command];
    }
    else if(!commandToEndpointsConfig.haveArgs) {
        res.response_text = "Unknown command ["+command+"]";
        return;
    }

    if(!commandConfig) commandConfig = commandToEndpointsConfig;

    // Hay default?
    if(commandConfig.default && req.commands.length == 0) {
        req.commands.push(commandConfig.default);
    }

    if(commandConfig.endpoint) {
        req.url = commandConfig.endpoint;
    }

    if(commandConfig.commands) {
        return convertCommandToEndpoint(req, res, commandConfig.commands);
    }

    if(req.commands[0] == "help") {
        res.response_text = getHelpText(commandConfig);
        return;
    }

    if(commandConfig.haveArgs && !req.commands.length) {
        res.response_text =  "Some parameters are missing, ex:" + "`" + getHelpText(commandConfig) + "`"
        return;
    }

    if(commandConfig.postFix) {
        req.url += commandConfig.postFix;
    }

    if(commandConfig.httpVerb) {
        req.method = commandConfig.httpVerb;
    }
}

function getHelpText(commandConfig) {

    helpText = "No help availble";
    if(commandConfig.help) {
        helpText = (commandConfig.help=="generate") ? generateHelpText(commandConfig) : commandConfig.help;
    }
    return helpText;
}

function generateHelpText(commandConfig) {
    helpText = [];
    Object.keys(commandConfig).forEach(function(key) {
        if(key=="help" || key=="default") return;
        if(commandConfig[key].help) {
            helpText.push(key + ": " + commandConfig[key].help);
        }
        else if(commandConfig[key].commands && commandConfig[key].commands.help) {
            helpText.push(key + ": " + commandConfig[key].commands.help);
        }
    });
    return helpText.join("\n");
}
