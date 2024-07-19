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
                console.log("guestdash.js: Selected group_project database");
            }
        });
    var username = req.session.username
    const sql = ("select *\n" +
                 "from users\n" +
                 "where username = '" + username + "';");
    con.query(sql, function(err,results){
      if (err){
        throw err;
      }
      var first_name = results[0].first_name;
      var last_name = results[0].last_name;
      var military_affiliation = results[0].military_affiliation;
      var military_rank = results[0].military_rank;
      var email = results[0].email;
      res.render('guestdash', {first_name, last_name, military_affiliation, military_rank, email});
    })
    
  } else {
    res.redirect("/userlogin");
  }
});

module.exports = router;
