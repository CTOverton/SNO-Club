const express = require('express');
const router = express.Router();
const request = require('request');

// MailChimp
const apiKey = 'YXBpa2V5OmQwNzFlZDVhYzUzMmYzODc0NzY4NWNjNTA4MDJlYzg4LXVzMTY=';

// Get Lists
router.get('/lists', function (req, res) {
    let options = { method: 'GET',
        url: 'https://us16.api.mailchimp.com/3.0/lists',
        headers:
            { 'Postman-Token': '89e9e9b9-d2ee-4e88-bb3d-d21c0ac6e0e0',
                'cache-control': 'no-cache',
                Authorization: 'Basic ' + apiKey } };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        res.format({
            'application/json': function(){
                res.send(body);
            }
        });
    });
});

// Get List Members
router.get('/lists/:listID/members', function (req, res) {
    let options = { method: 'GET',
        url: 'https://us16.api.mailchimp.com/3.0/lists/' + req.params.listID + '/members',
        headers:
            { 'Postman-Token': '720c6f4d-7974-472d-a326-99e86e1a7a5c',
                'cache-control': 'no-cache',
                Authorization: 'Basic ' + apiKey } };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        res.format({
            'application/json': function(){
                res.send(body);
            }
        });
    });
});

// Update Member
router.patch('/lists/:listID/members/:memberID', function (req, res) {
    let options = { method: 'PATCH',
        url: 'https://us16.api.mailchimp.com/3.0/lists/' + req.params.listID + '/members/' + req.params.memberID,
        headers:
            { 'Postman-Token': '87403391-a33e-480c-a088-c0c83fc3eb8a',
                'cache-control': 'no-cache',
                Authorization: 'Basic ' + apiKey,
                'Content-Type': 'application/json' },
        body: req.body,
        json: true };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        res.format({
            'application/json': function(){
                res.send(body);
            }
        });
    });
});

module.exports = router;