var express = require('express');
var router = express.Router();

let mysql = require('mysql2');

var connectionInfo = require('../lib/connectionInfo');

var con = mysql.createConnection({
  host: connectionInfo.host,
  user: connectionInfo.user,
  password: connectionInfo.password,
  port: connectionInfo.port,
  multipleStatements: true
});

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("userlogin.js: GET");
  res.render('userlogin', {});
});

/* POST page. */
router.post('/', function(req, res, next) {
  console.log("loginuser.js: POST");
  if (req.body.hashedPassword) {
    console.log("-------------- password -----------------")
    let mysql = "USE group_project;";
        con.query(mysql, function(err, results, fields) {
            if (err) {
                console.log(err.message);
                throw err;
            } else {
                console.log("register.js: Selected group_project database");
            }
        });
      // User is submitting user/password credentials
      const username = req.session.username;
      const hashedPassword = req.body.hashedPassword;
      const sql = "CALL check_credentials('" + username + "', '" + hashedPassword + "')";
      con.query(sql, function(err, results) {
          if (err) {
              throw err;
          }
          console.log("userlogin.js: Obtained result from accounts table below");
          // console.log(results);
          // console.log(results[0]);
          // console.log(results[0][0]);
          // console.log(results[0][0].result);
          if (results[0][0] === undefined || results[0][0].result == 0) {
              console.log("userlogin.js: No login credentials found");
              res.render('userlogin', {message: "Password not valid for user '" + username + "'.  Please log in again."});
          }
          else {
              console.log("loginuser.js: Credentials matched");
              const mysql = ("select user_role_id\n" +
                    "from users\n" +
                    "where username = '" + username + "';");
              con.query(mysql, function(err,results){
                  if (err){
                      throw err;
                  } 
                  console.log(results);
                  console.log(results[0]);
                  console.log(results[0].user_role_id);
                  if(results[0] === undefined || results[0].user_role_id == 1) {
                      req.session.loggedIn = true;
                      console.log("userlogin.js: Regular user login confirmed");
                      // res.render('userlogin', {message: "It worked"});
                      res.redirect("/guestdash");
                  } else if (results[0].user_role_id == 2) {
                      req.session.loggedIn = true;
                      console.log("userlogin.js: Staff user login confirmed");
                      // res.render('userlogin', {message: "It worked"});
                      res.redirect("/staffdash");
                  } else if (results[0].user_role_id == 3) {
                      req.session.loggedIn = true;
                      console.log("userlogin.js: Manager user login confirmed");
                      // res.render('userlogin', {message: "It worked"});
                      res.redirect("/staffdash");
                  }
              });
          }
      });
  } 
  else if (req.body.username != "") {
    let mysql = "USE group_project;";
        con.query(mysql, function(err, results, fields) {
            if (err) {
                console.log(err.message);
                throw err;
            } else {
                console.log("register.js: Selected group_project database");
            }
        });
      const username = req.body.username;
      console.log("userlogin.js: username is: " + username);
      const sql = "CALL get_salt('" + username + "')";
      con.query(sql, function(err, results) {
          if (err) {
              throw err;
          }
          if (results[0][0] === undefined) {
              console.log("userlogin: No results found");
              res.render('userlogin', {message: "User '" + username + "' not found"});
          } else {
              const salt = results[0][0].salt;
              req.session.username = username;
              req.session.salt = salt;
              res.render('userpassword', {
                  username: username,
                  salt: salt});
          }
      });

  }
  
});


module.exports = router;
