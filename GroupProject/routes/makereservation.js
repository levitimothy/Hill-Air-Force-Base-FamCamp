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
  res.render('makereservation', {});
});

router.post('/', function(req, res, next) {

  // Assign variables
  var site = req.session.site;
  var startDate = req.body.checkInDate;
  var endDate = req.body.checkOutDate;
  var username = req.session.username;

  //Start query
  let sql = "USE group_project;";
  con.query(sql, function(err, rows) {
    if (err){
      throw err;
    }
  
    // Get user id
    sql = "CALL get_user_id(?)";
    con.query(sql, [username], function(err, result) {
      if (err){
        throw err;
      }

      var userId = result[0][0].user_id;

      console.log("Site Number: " + site);
      console.log("Username: " + username);
      console.log("User ID: " + userId);

      // Reserve Site
      sql = "CALL make_reservation(?,?,?,?)"
      con.query(sql, [userId, site, startDate, endDate], function(err, result) {
        if(err){
          throw err;
        } else {
          console.log("Successful reservation to site " + site + "!")
        }
      })
    })
  })

  res.redirect('guestdash');
});

module.exports = router;
