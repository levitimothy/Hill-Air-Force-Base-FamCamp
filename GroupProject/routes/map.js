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
  let mysql = "USE group_project;";
        con.query(mysql, function(err, results, fields) {
            if (err) {
                console.log(err.message);
                throw err;
            } else {
                console.log("available.js: Selected group_project database");
            }
        });
    const sql = "call sites_map();";
    objForMapEJS = {}
    con.query(sql, function(err,rows){
        if (err){
            throw err;
        }
        objForMapEJS.sites = rows[0];
        res.render('map', objForMapEJS);
    });
});

router.post('/', function(req, res, next) {
  var selectedSite = req.body.site;
  req.session.site = req.body.site;
  console.log("We have selected: " + selectedSite);
  console.log("Session site is: " + req.session.site);

  res.redirect('/makereservation');
});

module.exports = router;
