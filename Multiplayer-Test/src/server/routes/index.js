let express = require('express');
let router = express.Router();

router.get('/', function(req, res) {
    res.sendfile('./src/client/html/index.html');
})

module.exports = router;