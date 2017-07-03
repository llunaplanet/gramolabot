const Repository = require('./repository.js')
const SlackTeam = require('./team.js')

module.exports = function TeamRepository(aws, tablePrefix) {

    this.repository = new Repository(aws, tablePrefix + "_settigns", "slack_team_id");

    function findBy(slack_team_id, callback) {

        var _self = this;

        this.repository.findBy(slack_team_id, function(err, doc) {
            if(err || !doc) return callback(err, null);
            var slackTeam = new SlackTeam(doc.slack_team_id);
            _self.mapDocToObject(slackTeam, doc);
            callback(null, slackTeam);
        });
    }

    function addOrReplace(slackTeam, callback) {

        var doc = this.mapObjectToDoc(slackTeam);
        this.repository.addOrReplace(doc, callback);
    }

    return {
        mapObjectToDoc: this.repository.mapObjectToDoc,
        mapDocToObject: this.repository.mapDocToObject,
        repository: this.repository,
        createTable: this.repository.createTable,
        deleteTable: this.repository.deleteTable,
        SlackTeam: SlackTeam,
        findBy: findBy,
        addOrReplace: addOrReplace,
    };

};
