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
                console.log("reshistory.js: Selected group_project database");
            }
        });
    const sql = "call previous_reservations();";
    objForAvailableEJS = {}
    con.query(sql, function(err,rows){
        if (err){
            throw err;
        }
        objForAvailableEJS.sites = rows[0];
        res.render('reshistory', objForAvailableEJS);
    });
    
  } else {
    res.redirect("/userlogin");
  }
});

module.exports = router;
