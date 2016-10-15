var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Discussion = require('../models/discussion');
var Response = require('../models/response');

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (res.apiQuery){
    res.json({})
  } else {
    res.render('discussions', {});
  }
});

router.get('/new', function(req, res, next) {
  res.render('new-discussion', {});
});

router.get('/id/:discussion_id([0-9a-f]{24})', function(req, res, next) {
	var discussionId = mongoose.Types.ObjectId(req.params.discussion_id.toString());
	Discussion.findById(discussionId, function (err, foundDiscussion) {
    var responses = {};
    Response.find({
      '_id': { $in: foundDiscussion.responses}
    }, function (err, foundResponses) { 
      if (req.apiQuery){
        res.json({discussion: foundDiscussion, responses: foundResponses});
      } else {
        res.render('discussion', {discussionId: discussionId}); 
      }
    })
	});
});

router.post('/', function(req, res, next) {
  var newReponse = new Response({
    isLink: false,
    title: req.body.responseTitle,
    text: req.body.responseText,
    created_by: 'Daniel'
  });

  newReponse.save(function(err, savedResponse){
      var newDiscussion = new Discussion({
        title: req.body.discussionTitle,
        tags: req.body.tags,
        public: req.body.visibility == 'public',
        created_by: 'Daniel',
        responses: savedResponse.id
      });
      newDiscussion.save(function(err, savedDiscussion) {
        savedResponse.update({
          original_discussion: savedDiscussion.id
        })
       res.redirect('/discussions/id/' + savedDiscussion.id);
      });
  });
});

router.put('/id/:discussion_id([0-9a-f]{24})', function(req, res, next) {
  res.render('discussion', {});
});

router.delete('/id/:discussion_id', function(req, res, next) {
  
});

module.exports = router;

function validDiscussion(discussion){
  return true;
}
