var express = require('express');
var router = express.Router();


router.get('/debug/tables/:table_name', function(req, res, next){
    var dynamodb = new req.app.locals.aws.DynamoDB();

    var params = {
        TableName: req.params.table_name,
    };

    dynamodb.scan(params, function(err, data) {
        if (err) return next(err);
        res.send("<pre>" + JSON.stringify(data, null, 2) + "</pre>");
    });

});

router.get('/debug/tables', function(req, res, next){
    var dynamodb = new req.app.locals.aws.DynamoDB();
    dynamodb.listTables({}, function(err, data) {
        if (err) return next(err); // an error occurred
        res.json(data);
    });
});

module.exports = router;
