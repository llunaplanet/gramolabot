var express = require('express');
var app = express();

app.all('*', function(req, res) {
    var output = {
        url: req.url,
        headers: req.headers
    }
    res.send(JSON.stringify(output, null, 2));
});

app.listen(3000);
