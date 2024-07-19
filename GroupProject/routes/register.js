var express = require('express');
var router = express.Router();

let mysql = require('mysql2');

var dbConnectionInfo = require('../lib/connectionInfo');

var con = mysql.createConnection({
  host: dbConnectionInfo.host,
  user: dbConnectionInfo.user,
  password: dbConnectionInfo.password,
  port: dbConnectionInfo.port,
  multipleStatements: true
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('register', {});
});



router.post('/', function(req, res, next) {
  con.connect(function(err) {
      if (err) {
        throw err;
      }
      else {
        console.log("register.js: Connected to server!");
        var username = req.body.username
        var password = req.body.hash
        var salt = req.body.salt
        var first_name = req.body.first_name
        var last_name = req.body.last_name
        var email = req.body.email
        var military_rank = req.body.military_rank
        var military_affiliation = req.body.military_affiliation
        var user_role = 'regular'
        var card_number = req.body.card_number
        var cvv = req.body.cvv
        var expiration = req.body.expiration
        var values = [username, password, salt, first_name, last_name, email, military_rank, military_affiliation,
                      user_role, card_number, cvv, expiration]
        let sql = "USE group_project;";
        con.query(sql, function(err, results, fields) {
            if (err) {
                console.log(err.message);
                throw err;
            } else {
                console.log("register.js: Selected group_project database");
            }
        });
        con.query("CALL register_user(?,?,?,?,?,?,?,?,?,?,?,?,@result); SELECT @result", values,function (err, rows) {
          if (err) {
              console.log(err.message);
              throw err;
          }
          if (rows[1][0]['@result'] != 0){
              console.log("redister.js: failed to register user");
              // res.redirect('/');
              res.render('register', {message: "The username '" + username + "' already exists"});
          } else {
            console.log("register.js: new user " + first_name + " " + last_name + " registered");
            res.render("userlogin",{});
          }
        });
      }
  });
});

module.exports = router;