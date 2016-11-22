var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');

var Discussion = require('../models/discussion');
var Response = require('../models/response');
var Account = require('../models/account');

router.get('/', function(req, res, next) {
	Response.find({}, function(err, result, count){
		res.send('/public/index.html')
	})
});

router.get('/index', function(req, res, next){
	Response.find()
			.sort({'created_on': -1})
			.limit(30)
			.exec(function(err, responses){
				res.render('index', {responses: responses, user: req.user});
			})
})

router.post('/login', passport.authenticate('local'), function(req, res) {
	res.redirect(req.header('Referer'));
});

router.post('/register', function(req, res, next){
	var newAccount = new Account({
		first_name: req.body.firstName,
		last_name: req.body.lastName,
		username: req.body.username,
	})
	Account.register(newAccount, req.body.password, function(err, account) {
		if (err) {
			console.log(err)
			res.redirect(req.header('Referer'));
		} else {
			passport.authenticate('local')(req, res, function () {
				res.redirect(req.header('Referer'));
			});
		}
	});
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect("/");
});

router.get('/ping', function(req, res){
	res.status(200).send("pong!");
});

router.get('/profile', function(req, res, next){
	if (req.user){
		Account.findOne({_id: req.user._id}, function(err, foundAccount){
			Response.find({
				'_id': { $in: foundAccount.responses}
			}, function (err, foundResponses) {
				Discussion.find({
					'_id': { $in: foundAccount.discussions}
				}, function (err, foundDiscussions) {
					res.render('profile', {user: foundAccount, discussions: foundDiscussions, responses: foundResponses});
				});
			});
		});
	} else {
		res.render('login');
	}
})

router.get('/demo', function(req, res, next){
	var sampleResponse1 = new Response({
		title: "Here's a message",
		text: "Click and drag to shift the discussion and use the scroll wheel to zoom. Try writing a few replies.",
		created_by: "Daniel",
	  });
	  var sampleResponse2 = new Response({
		title: "You can start a new discussion",
		text: "Click on the plus sign on the top right of the screen to start a new discussion. Share the link with a friend to discuss together live.",
		created_by: "Striped Rhino",
	  });
	  var sampleResponse3 = new Response({
		title: "Try replying by citing a response",
		text: "You can cite existing responses as a reply. Click reply, click the browse button, and cite a response.",
		created_by: "Striped Rhino",
	  });
	  var relationship1 = {};
	  var relationship2 = {};
	  var relationship3 = {};
	  relationship1[sampleResponse1._id] = {relatedResponse: "", relationshipType: 'root'};
	  relationship2[sampleResponse2._id] = {relatedResponse: sampleResponse1._id, relationshipType: 'dissent'};
	  relationship3[sampleResponse3._id] = {relatedResponse: sampleResponse1._id, relationshipType: 'dissent'};
	  var sampleDiscussion = new Discussion({
		responses: [sampleResponse1._id, sampleResponse2._id, sampleResponse3._id],
		citations: [],
		relationships: [relationship1, relationship2, relationship3]
	  });

	  sampleResponse1.save(function(err, savedres1){
		sampleResponse2.save(function(err, savedres2){
			sampleResponse3.save(function(err, savedres3){
				sampleDiscussion.save(function(err, savedDisc){
					res.redirect('/discussions/id/' + savedDisc._id);
				})
			})
		})
	  })
})

module.exports = router;
