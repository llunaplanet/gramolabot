var express = require('express');
var router = express.Router();
var routerHelpers = require('../helpers')

router.param('team_id', routerHelpers.team_id_param_processing);
router.param('channel_id', routerHelpers.channel_id_param_processing);

router.post('/teams/:team_id/connect', require('./connect.js'))
router.post('/teams/:team_id/debug', require('./debug.js'))
router.post('/teams/:team_id/authorize', require('./authorize.js'))
router.post('/teams/:team_id/reauthorize', require('./reauthorize.js'))
router.get('/teams/:team_id/spotify-callback', require('./spotify-callback.js'))

module.exports = router;
