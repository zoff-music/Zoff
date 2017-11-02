var express = require('express');
var router = express.Router();
var path = require('path');
var nodemailer = require('nodemailer');
var mailconfig = require(path.join(__dirname, '../config/mailconfig.js'));
var mongo_db_cred = {config: 'mydb'};
var mongojs = require('mongojs');
var db = mongojs(mongo_db_cred.config);

router.use(function(req, res, next) {
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/api/frontpages').get(function(req, res) {
    db.collection("frontpage_lists").find({frontpage: true, count: {$gt: 0}}, function(err, docs) {
        db.collection("connected_users").find({"_id": "total_users"}, function(err, tot) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({channels: docs, viewers: tot[0].total_users}));
        });
    });
});

router.route('/api/list/:channel_name').get(function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var channel_name = req.params.channel_name;
    db.collection(channel_name).find({views: {$exists: false}}, {added: 1, id: 1, title: 1, votes: 1, duration: 1, type: 1, _id: 0}, function(err, docs) {
        if(docs.length > 0) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(docs));
        } else {
            res.status(404);
            res.send(404);
        }
    });
});

router.route('/api/conf/:channel_name').get(function(req, res) {
    var channel_name = req.params.channel_name;
    db.collection(channel_name).find({views: {$exists: true}},
        {
            addsongs: 1,
            adminpass: 1,
            allvideos: 1,
            frontpage: 1,
            longsongs: 1,
            removeplay: 1,
            shuffle: 1,
            skip: 1,
            startTime: 1,
            userpass: 1,
            vote: 1,
            _id: 0
        }, function(err, docs) {
        if(docs.length > 0) {
            var conf = docs[0];
            if(conf.adminpass != "") {
                conf.adminpass = true;
            } else {
                conf.adminpass = false;
            }
            if(conf.userpass != "") {
                conf.userpass = true;
            } else {
                conf.userpass = false;
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(conf));
        } else {
            res.status(404);
            res.send(404);
        }
    });
});

router.route('/api/imageblob').post(function(req, res) {
    var Jimp = require("jimp");
    Jimp.read('https://img.youtube.com/vi/' + req.body.id + '/mqdefault.jpg', function (err, image) {
        if (err) console.log(err);
        image.blur(50)
             .write(path.join(pathThumbnails, '/public/assets/images/thumbnails/' + req.body.id + '.jpg'), function(e, r) {
                 res.send(req.body.id + ".jpg");
             });
    });
});


router.route('/api/mail').post(function(req, res) {
   let transporter = nodemailer.createTransport(mailconfig);

   transporter.verify(function(error, success) {
      if (error) {
           res.sendStatus(500);
           return;
      } else {
         var from = req.body.from;
         var message = req.body.message;
         var msg = {
             from: 'no-reply@zoff.no',
             to: 'contact@zoff.no',
             subject: 'ZOFF: Contact form webpage',
             text: message,
             html: message,
             replyTo: from
          }
          transporter.sendMail(msg, (error, info) => {
              if (error) {
                  res.send("failed");
                  return;
              }
              res.send("success");
              transporter.close();
          });
      }
   });
});

module.exports = router;