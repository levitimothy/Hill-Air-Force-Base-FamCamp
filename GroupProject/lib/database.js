let mysql = require('mysql2');

var dbConnectionInfo = require('./connectionInfo');

var con = mysql.createConnection({
  host: dbConnectionInfo.host,
  user: dbConnectionInfo.user,
  password: dbConnectionInfo.password,
  port: dbConnectionInfo.port,
  multipleStatements: true              // Needed for stored proecures with OUT results
});

con.connect(function(err) {
  if (err) {
    throw err;
  }
  else {
    console.log("database.js: Connected to server!");
    
    con.query("CREATE DATABASE IF NOT EXISTS group_project", function (err, result) {
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: group_project database created if it didn't exist");
      selectDatabase();
    });
  }
});

function selectDatabase() {
    let sql = "USE group_project";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: Selected group_project database");
        createTables();
        createStoredProcedures();
        addTableData();
        //AddDummyDataToDatabase();
      }
    });
}

function createTables() {
  let sql = "CREATE TABLE IF NOT EXISTS user_types (" +
    "type_id INT NOT NULL AUTO_INCREMENT," +
    "user_type_name VARCHAR(25) NOT NULL," +
    "PRIMARY KEY (type_id)" +
    ")";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table user_types created if it didn't exist");
      }
    }); 

    sql =
            "CREATE TABLE IF NOT EXISTS users (\n" +
            "user_id INT NOT NULL AUTO_INCREMENT,\n" +
            "username VARCHAR(255) NOT NULL,\n" +
            "hashed_password VARCHAR(255) NOT NULL,\n" +
            "salt VARCHAR(255) NOT NULL,\n" +
            "first_name VARCHAR(100) NOT NULL,\n" +
            "last_name VARCHAR(100) NOT NULL,\n" +
            "email VARCHAR(255) NOT NULL,\n" +
            "military_rank VARCHAR(100) NOT NULL,\n" +
            "military_affiliation VARCHAR(100) NOT NULL,\n" +
            "user_role_id INT NOT NULL,\n" +
            "PRIMARY KEY (user_id),\n" +
            "FOREIGN KEY (user_role_id) REFERENCES user_types(type_id)\n" +
        ")";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table users created if it didn't exist");
      }
    });

    sql = "CREATE TABLE IF NOT EXISTS sites (" +
    "site_id INT NOT NULL AUTO_INCREMENT,\n" +
    "site_type VARCHAR(100) NOT NULL,\n" +
    "site_number VARCHAR(100) NOT NULL,\n" +
    "site_cost DECIMAL(10,2) NOT NULL,\n" +
    "reserved BOOLEAN NOT NULL,\n" +
    "PRIMARY KEY (site_id)" +
    ")";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table sites created if it didn't exist");
      }
    }); 

    sql = "CREATE TABLE IF NOT EXISTS reservations (\n" +
    "reservation_id INT NOT NULL AUTO_INCREMENT,\n" +
    "reservation_start_date DATE NOT NULL,\n" +
    "reservation_end_date DATE NOT NULL,\n" +
    "reservation_duration INT NOT NULL,\n" +
    "user_id_reservations INT NOT NULL,\n" +
    "site_id_reservations INT NOT NULL,\n" +
    "PRIMARY KEY (reservation_id),\n" +
    "FOREIGN KEY (user_id_reservations) REFERENCES users(user_id),\n" +
    "FOREIGN KEY (site_id_reservations) REFERENCES sites(site_id)\n" +
    ")";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table reservations created if it didn't exist");
      }
    }); 

    sql = "CREATE TABLE IF NOT EXISTS payments (" +
    "payment_confirmation_id INT NOT NULL AUTO_INCREMENT,\n" +
    "payment_type VARCHAR(100) NOT NULL,\n" +
    "payment_date DATE NOT NULL,\n" +
    "PRIMARY KEY (payment_confirmation_id)" +
    ")";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table payments created if it didn't exist");
      }
    }); 

    sql = "CREATE TABLE IF NOT EXISTS payment_information (\n" +
    "payment_information_id INT NOT NULL AUTO_INCREMENT,\n" +
    "card_number VARCHAR(100) NOT NULL,\n" +
    "card_cvv VARCHAR(10) NOT NULL,\n" +
    "card_expiration_date DATE NOT NULL,\n" +
    "user_id_payment_information INT NOT NULL,\n" +
    "PRIMARY KEY (payment_information_id),\n" +
    "FOREIGN KEY (user_id_payment_information) REFERENCES users(user_id)" +
    ")";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table payment_information created if it didn't exist");
      }
    }); 


}

function createStoredProcedures() {
  let sql = "CREATE PROCEDURE IF NOT EXISTS `insert_user_type`(\n" +
                "IN user_type VARCHAR(45)\n" +
                ")\n" +
                "BEGIN\n" +
                "INSERT INTO user_types (user_type_name)\n" +
                "SELECT user_type FROM DUAL\n" +
                "WHERE NOT EXISTS (\n" +
                "SELECT * FROM user_types\n" +
                "WHERE user_types.user_type_name=user_type LIMIT 1\n" +
                ");\n" +
                "END;";

    con.query(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
    } else {
        console.log("database.js: procedure insert_user_type created if it didn't exist");
    }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `register_user`(\n" +
                    "IN  username VARCHAR(255), \n" +
                    "IN  hashed_password VARCHAR(255), \n" +
                    "IN  salt VARCHAR(255), \n" +
                    "IN  first_name VARCHAR(255), \n" +
                    "IN  last_name VARCHAR(255), \n" +
                    "IN  email VARCHAR(255), \n" +
                    "IN  military_rank VARCHAR(255), \n" +
                    "IN  military_affiliation VARCHAR(255), \n" +
                    "IN user_role VARCHAR(45), \n" +
                    "IN card_number VARCHAR(100), \n" +
                    "IN card_cvv VARCHAR(10), \n" +
                    "IN card_expiration_date DATE, \n" +
                    "OUT result INT\n" +
                ")\n" +
              "BEGIN\n" +
                  "DECLARE nCount INT DEFAULT 0;\n" +
                  "SET result = 0;\n" +
                  "SELECT Count(*) INTO nCount FROM users WHERE users.username = username;\n" +
                  "IF nCount = 0 THEN\n" +
                      "INSERT INTO users (username, hashed_password, salt, first_name, last_name, email, military_rank, military_affiliation, user_role_id)\n" +
                      "VALUES (username, hashed_password, salt, first_name, last_name, email, military_rank, military_affiliation, (SELECT type_id FROM user_types WHERE user_types.user_type_name = user_role));\n" +

                      "INSERT INTO payment_information (card_number, card_cvv, card_expiration_date, user_id_payment_information)\n" +
                      "VALUES (card_number, card_cvv, card_expiration_date, LAST_INSERT_ID());\n" +
                  "ELSE\n" +
                      "SET result = 1;\n" +
                  "END IF;\n" +
              "END;"
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure register_user created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `check_credentials`(\n" +
              "IN username VARCHAR(255),\n" +
              "IN hashed_password VARCHAR(255)\n" +
          ")\n" +
          "BEGIN\n" +
              "SELECT EXISTS(\n" +
                "SELECT * FROM users\n" +
                "WHERE users.username = username AND users.hashed_password = hashed_password\n" +
              ") AS result;\n" +
          "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure check_credentials created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_salt`(\n" +
              "IN username VARCHAR(255)\n" +
          ")\n" +
          "BEGIN\n" +
              "SELECT salt FROM users\n" +
              "WHERE users.username = username\n" +
              "LIMIT 1;\n" +
          "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_salt created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `change_user_type`(\n" +
            "IN p_username VARCHAR(255),\n" +
            "IN user_role VARCHAR(45)\n" +
        ")\n" +
        "BEGIN\n" +
            "UPDATE users\n" +
            "SET user_role_id = (SELECT type_id FROM user_types WHERE user_types.user_type_name = user_role)\n" +
            "WHERE username = p_username\n;" +
        "END;";

    con.query(sql, function(err, results, fields) {
        if (err) {
        console.log(err.message);
        throw err;
        } else {
        console.log("database.js: procedure change_user_type created if it didn't exist");
        }
        });

        sql = "CREATE PROCEDURE IF NOT EXISTS `get_user_type`(\n" +
          "IN username VARCHAR(255),\n" +
          "OUT result VARCHAR(25)\n" +
      ")\n" +
      "BEGIN\n" +
          "DECLARE user_type_result VARCHAR(25);\n" +
          "SELECT user_type_name INTO user_type_result FROM user_types\n" +
          "INNER JOIN users ON user_types.type_id = users.user_role_id\n" +
          "WHERE users.username = username\n" +
          "LIMIT 1;\n" +
          "SET result = user_type_result;\n" +
      "END;";

      con.query(sql, function(err, results, fields) {
        if (err) {
          console.log(err.message);
          throw err;
        } else {
          console.log("database.js: procedure get_user_type created if it didn't exist");
        }
      });

      sql = "CREATE PROCEDURE IF NOT EXISTS `get_user_id`(\n" +
          "IN username VARCHAR(255)\n" +
      ")\n" +
      "BEGIN\n" +
          "SELECT user_id FROM users\n" +
          "WHERE users.username = username;\n" +
      "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_user_id created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_user_list`(\n" +
          "IN user_type VARCHAR(255)\n" +
      ")\n" +
      "BEGIN\n" +
          "SELECT user_id, username, name FROM users\n" +
          "INNER JOIN user_types ON users.user_role_id = user_types.type_id\n" +
          "WHERE user_types.user_type_name = user_type;\n" +
      "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_user_list created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_username`(\n" +
          "IN user_id INT\n" +
      ")\n" +
      "BEGIN\n" +
          "SELECT username FROM users\n" +
          "WHERE users.user_id = user_id;\n" +
      "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_username created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `change_password`(\n" +
          "IN username VARCHAR(255),\n" +
          "IN new_password VARCHAR(255),\n" +
          "IN new_salt VARCHAR(255)\n" +
      ")\n" +
      "BEGIN\n" +
          "UPDATE users SET hashed_password = new_password, salt = new_salt WHERE users.username = username;\n" +
      "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure change_password created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `make_reservation`(\n" +
          "IN p_user_id INT,\n" +
          "IN p_site_number VARCHAR(255),\n" +
          "IN p_start_date DATE,\n" +
          "IN p_end_date DATE\n" +
      ")\n" +
      "BEGIN\n" +
          "DECLARE p_reservation_duration INT;\n" +
          "SET p_reservation_duration = DATEDIFF(p_end_date, p_start_date);\n" +

          "INSERT INTO reservations (reservation_start_date, reservation_end_date, reservation_duration, user_id_reservations, site_id_reservations) VALUES (p_start_date, p_end_date, p_reservation_duration, p_user_id, (SELECT site_id FROM sites WHERE site_number = p_site_number));\n" +

          "UPDATE sites SET reserved = TRUE WHERE site_number = p_site_number;\n" +
      "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure make_reservation created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `cancel_reservation`(\n" +
          "IN p_reservation_id INT\n" +
      ")\n" +
      "BEGIN\n" +
          "UPDATE sites SET reserved = FALSE WHERE site_id = (SELECT site_id_reservations FROM reservations WHERE reservation_id = p_reservation_id);\n" +
          "DELETE FROM reservations WHERE reservation_id = p_reservation_id;\n" +
      "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure cancel_reservation created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `insert_site`(\n" +
          "IN p_site_type VARCHAR(100),\n" +
          "IN p_site_number VARCHAR(100)\n" +
      ")\n" +
      "BEGIN\n" +
          "DECLARE p_site_cost DECIMAL(10,2);\n" +
          "CASE p_site_type\n" +
            "WHEN 'normal_site' THEN SET p_site_cost = 25.00;\n" +
            "WHEN 'dry_site' THEN SET p_site_cost = 17.00;\n" +
            "WHEN 'tent_site' THEN SET p_site_cost = 17.00;\n" +
            "WHEN 'dry_storage' THEN SET p_site_cost = 5.00;\n" +
            "WHEN 'popup_trailer' THEN SET p_site_cost = 30.00;\n" +
          "END CASE;\n" +
          "IF NOT EXISTS (SELECT 1 FROM sites WHERE site_number = p_site_number) THEN\n" +
            "INSERT INTO sites (site_type, site_number, site_cost, reserved) VALUES (p_site_type, p_site_number, p_site_cost, FALSE);\n" +
          "END IF;\n" +
      "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure insert_site created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `check_if_reserved`(\n" +
          "IN p_site_number INT\n" +
      ")\n" +
      "BEGIN\n" +
          "SELECT reserved FROM sites WHERE site_number = p_site_number;\n" +
      "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure check_if_reserved created if it didn't exist");
      }
    });

    
    sql = "CREATE PROCEDURE IF NOT EXISTS `check_available_sites`()\n" +
    "BEGIN\n" +
    "SELECT site_id, min(DATE(reservation_start_date)) as reservation_start_date, min(DATE(reservation_end_date)) as reservation_end_date\n" +
    "FROM sites s left join reservations r on s.site_id = r.site_id_reservations\n" +
    "WHERE site_id NOT IN\n" + 
    "(SELECT site_id\n" +
    "FROM sites s INNER JOIN\n" +
    "reservations r ON s.site_id = r.site_id_reservations\n" +
    "WHERE reservation_start_date <= current_date()\n" +
    "AND reservation_end_date >= current_date())\n" +
    "AND reservation_start_date > current_date()\n" +
    "OR reservation_start_date IS NULL\n" +
    "group by site_id;\n" +
    "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure check_available_sites created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `previous_reservations`()\n" +
    "BEGIN\n" +
    "SELECT site_id, DATE(reservation_start_date) as reservation_start_date, DATE(reservation_end_date) as reservation_end_date\n" +
    "FROM sites s INNER JOIN\n" +
    "reservations r ON s.site_id = r.site_id_reservations\n" +
    "WHERE reservation_end_date <= current_date();\n" +
    "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure previous_reservations created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `previous_user_reservations`(\n" +
    "IN username VARCHAR(100)\n" +
    ")\n" +
    "BEGIN\n" +
    "SELECT site_id, DATE(reservation_start_date) as reservation_start_date, DATE(reservation_end_date) as reservation_end_date\n" +
    "FROM sites s INNER JOIN\n" +
    "reservations r ON s.site_id = r.site_id_reservations\n" +
    "INNER JOIN users u ON r.user_id_reservations = u.user_id\n" +
    "WHERE reservation_end_date <= current_date()\n" +
    "AND u.username = username;\n" +
    "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure previous_user_reservations created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `sites_reserved_today`()\n" +
    "BEGIN\n" +
    "SELECT site_id, reservation_start_date, reservation_end_date\n" +
    "FROM sites s\n" +
    "LEFT JOIN reservations r ON s.site_id = r.site_id_reservations\n" +
    "INNER JOIN users u ON r.user_id_reservations = u.user_id\n" +
    "WHERE reservation_start_date <= current_date()\n" +
    "AND reservation_end_date >= current_date();\n" +
    "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure sites_reserved_today created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `sites_map`()\n" +
    "BEGIN\n" +
    "SELECT site_id, site_number,\n" +
    "IF(site_id_reservations IN (\n" +
      "SELECT site_id_reservations\n" +
      "FROM reservations\n" +
      "WHERE reservation_start_date <= CURRENT_DATE()\n" +
      "AND reservation_end_date >= CURRENT_DATE()), 'no','yes') AS available,\n" +
    "IF(DATEDIFF(MIN(DATE(reservation_end_date)), MIN(DATE(reservation_start_date))) IS NULL,\n" +
        "'No reservations yet', \n" +
        "DATEDIFF(MIN(DATE(reservation_end_date)),MIN(DATE(reservation_start_date)))) AS days_available,\n" +
    "site_cost,\n" +
    "IF(site_type IN ('dry_site' , 'tent_site'),\n" +
        "'Dry Lot','Pull-Through') AS type,\n" +
    "IF(site_type IN ('normal_site' , 'popup_trailer'),'Full','None') AS hook_ups\n" +
    "FROM sites s\n" +
    "LEFT JOIN reservations r ON s.site_id = r.site_id_reservations\n" +
    "WHERE site_id NOT IN (\n" +
      "SELECT site_id\n" +
      "FROM sites s\n" +
      "INNER JOIN reservations r ON s.site_id = r.site_id_reservations\n" +
      "WHERE reservation_start_date <= CURRENT_DATE()\n" +
      "AND reservation_end_date >= CURRENT_DATE())\n" +
    "AND reservation_start_date > CURRENT_DATE()\n" +
    "OR reservation_start_date IS NULL\n" +
    "GROUP BY site_id;\n" +
    "END;";

    con.query(sql, function(err, results, fields) {
        if (err) {
          console.log(err.message);
          throw err;
        } else {
          console.log("database.js: procedure sites_map created if it didn't exist");
        }
    });

}

function addTableData() {
  let sql = "CALL insert_user_type('regular')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'regular' to user_types");
    });

    sql = "CALL insert_user_type('staff')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'staff' to user_types");
    });

    sql = "CALL insert_user_type('manager')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'manager' to user_types");
    });

    // Add Sites to Database
    sql = "CALL insert_site('tent_site', 'tent')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'tent_site' to sites");
    });

    sql = "CALL insert_site('dry_site', 'A')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'dry_site: A' to sites");
    });

    sql = "CALL insert_site('dry_site', 'B')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'dry_site: B' to sites");
    });

    sql = "CALL insert_site('dry_site', 'C')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'dry_site: C' to sites");
    });

    sql = "CALL insert_site('dry_site', 'D')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'dry_site: D' to sites");
    });

    sql = "CALL insert_site('popup_trailer', '11B')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'Site: 11B' to sites");
    });

    sql = "CALL change_user_type( 'admin', 'manager');"
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: changed admin to manager");
    });

    // Add the rest of the sites
    for(i = 1; i <= 45; i++) {
      sql = "CALL insert_site(?, ?)";
        con.query(sql, ["normal_site", i], function(err,rows){
          if (err) {
            console.log(err.message);
            throw err;
          }
        });
    }
}

module.exports = con;