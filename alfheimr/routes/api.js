const express = require('express');
const router = express.Router();
var redis = require("redis"),
client = redis.createClient();


router.get('/', (req, res) => {res.send('respond with hello');});

/*################################### create user ##########################################*/
router.put('/createUser/:userName', (req, res) => {
  var userName = "user:" + req.params.userName;
  var name = req.query.name;
  var password = req.query.password;
  client.on("error", function (err) {
    console.log("Error " + err);
  });
  client.exists("user",userName, function (err, replies) {
    if(!err && replies===1){
      res.send("username already exists");
    }else{
      client.hmset(userName, ["name", name,"password", password], redis.print);
      res.send('user created successfully!');
    } 
  });
});

/*################################### retrieve user #########################################*/
router.get('/user', (req, res) => {res.send('Pls give a userName'); });
router.get('/user/:userName', (req, res) => {
  var userName = "user:" + req.params.userName;
  client.on("error", function (err) {
    console.log("Error " + err);
  });
  client.hgetall(userName, function (err, obj) {
    res.send(JSON.stringify(obj));
  });
});

/*########################################### follow  ##########################################*/
router.post('/user/:userName/follow', (req, res) => {
  var userName = req.params.userName;
  var friendId = req.query.friendId;
  client.on("error", function (err) {
    console.log("Error " + err);
  });
  client.rpush("user:" + userName + ":followList", friendId);
  client.rpush("user:" + friendId + ":followerList", userName);
  res.send("following !");
});

/*########################################### unfollow  ##########################################*/
router.post('/user/:userName/unFollow', (req, res) => {
  var userName = req.params.userName;
  var friendId = req.query.friendId;
  client.on("error", function (err) {
    console.log("Error " + err);
  });
  client.lrem("user:" + userName + ":followList", 1, friendId);
  client.lrem("user:" + friendId + ":followerList", 1, userName);
  res.send("unfollowed successfully!");
});

/*###################################### following list  ##########################################*/
router.get('/user/:userName/followingList', (req, res) => {
  var userName = req.params.userName;
  client.on("error", function (err) {
    console.log("Error " + err);
  });
  client.lrange("user:" + userName + ":followList", 0, -1, function (err, reply) {
    res.send(JSON.stringify(reply));
  });
});

/*###################################### followers list  ########################################*/
router.get('/user/:userName/followersList', (req, res) => {
  var userName = req.params.userName;
  client.on("error", function (err) {
    console.log("Error " + err);
  });
  client.lrange("user:" + userName + ":followerList", 0, -1, function (err, reply) {
    res.send(JSON.stringify(reply));
  });
});

/*####################################### add post  ###########################################*/
router.post('/user/:userName/addPost', (req, res) => {
  var userName = req.params.userName;
  var post = {
    postId: "user:" + userName + ":post:",
    message: req.query.message
  };
  client.on("error", function (err) {
    console.log("Error " + err);
  });

  client.llen("user:" + userName + ":postList", function (err, reply) {
    if (err) { console.log("Error " + err); }
    console.log(reply);
    post.postId += reply
    client.hmset(post.postId, ["message", post.message, "datetime", Date.now()], function (err, reply) {
      if (err) {
        console.log("Error " + err);
      }
      client.rpush("user:" + uid + ":postList", post.postId, function (err, reply) {
        if (err) {
          console.log("Error " + err);
        }
      })
    })
  })
  res.send("Status update posted");
});

/*################################### retrieve all the posts  ######################################*/
router.get('/user/:userName/postList', (req, res) => {
  var userName = req.params.userName;
  console.log(userName);
  client.on("error", function (err) {
    console.log("Error " + err);
  });
  client.lrange("user:" + userName + ":postList", 0, -1, function (err, posts) {
    console.log(posts);
    res.send(JSON.stringify(posts));
  });
});

module.exports = router;
