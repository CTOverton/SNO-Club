const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    res.format({
        'application/json': function(){
            res.send({msg: 'Welcome to SNO API'});
        }
    });
});

module.exports = router;