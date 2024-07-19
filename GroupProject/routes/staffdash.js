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
  if (req.session.loggedIn) {
    let mysql = "USE group_project;";
        con.query(mysql, function(err, results, fields) {
            if (err) {
                console.log(err.message);
                throw err;
            } else {
                console.log("staffdash.js: Selected group_project database");
            }
        });
    const username = req.session.username;
    const sql = ("select user_role_id\n" +
                    "from users\n" +
                    "where username = '" + username + "';");
              con.query(sql, function(err,results){
                  if (err){
                      throw err;
                  }
                  if(results[0] === undefined || results[0].user_role_id == 1) {
                      req.session.loggedIn = true;
                      console.log("staffdash.js: Regular user logged in");
                      res.redirect("/guestdash");
                  } else if (results[0].user_role_id == 2) {
                      req.session.loggedIn = true;
                      console.log("staffdash.js: Staff user logged in");
                      res.render('staffdash', {  });
                  } else if (results[0].user_role_id == 3) {
                      req.session.loggedIn = true;
                      console.log("staffdash.js: Manager user logged in");
                      res.render('staffdash', {  });
                  }
              });
              
  } else {
    res.redirect("/userlogin");
  }
});

module.exports = router;
