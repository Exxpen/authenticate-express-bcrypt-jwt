var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var router = express.Router();

var saltRounds = 10;
var users = [];

function findUser(email) {
    var user = users.find(function (element) {
        return element.email === email
    });
    return (typeof user === 'undefined') ? false : user;
}

router.get('/debug', function(req, res, next) {
    res.send(JSON.stringify(users));
});

router.post('/signup', function (req, res, next) {
    var post = req.body;
    if (!post.email || !post.password) {
        res.send(JSON.stringify({
            status: 'fail',
            error: 'email or password was missing'
        }));
    } else if (findUser(post.email)) {
        res.send(JSON.stringify({
            status: 'fail',
            error: 'username already exists'
        }));
    } else {
        bcrypt.hash(post.password, saltRounds, function (err, hash) {
            users.push({
                email: post.email,
                password: hash
            });
        });
        res.send(JSON.stringify({
            status: 'ok'
        }));
    }
});

router.post('/auth', function (req, res, next) {
    var post = req.body;
    if (!post.email || !post.password) {
        res.send(JSON.stringify({
            status: 'fail',
            error: 'email or password was missing'
        }));
    } else {
        var authUser = findUser(post.email);
        if (authUser) {
            bcrypt.compare(post.password, authUser.password, function(err, good) {
                if (good) {
                    res.send(JSON.stringify({
                        status: 'ok',
                        message: 'you got authenticated as ' + authUser.email
                    }));
                } else {
                    res.send(JSON.stringify({
                        status: 'fail',
                        error: 'wrong password'
                    }));
                }
            });
        } else {
            res.send(JSON.stringify({
                status: 'fail',
                error: 'user does not exist'
            }));
        }
    }
});

module.exports = router;
