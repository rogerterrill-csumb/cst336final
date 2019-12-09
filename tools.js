const request = require('request');
const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');

module.exports = {


  //function to connect to database
  createConnection: function() {
    var connection = mysql.createConnection({
      host: 'cst336final.mysql.database.azure.com',
      user: 'dbadmin@cst336final',
      password: 'Otter2020!',
      database: 'eStore',
      port: 3306
    });

    //handle errors during connection
    connection.on('error', function(err) {
      console.log(err.code);
    });
    
    //handle errors for closed connection
    //eg 'connections closed without response',ECONNRESET, ...
    connection.on('close', function(err) {
      console.log(err.code);
    });
    
    //handle errors for end of connection
    //eg. ER_TOO_MANY_USER_CONNECTIONS:
   /* connection.end(function(err) 
    {
      if (err) 
      {
        console.log(err.message);
      }
    }); */
    
    return connection;
  }, //createConnection
  
    /**Return product info from API
   * @param string keyword - search term
   * @param int imageCount - number of random images
   * @return array of product info (description, price, imageURL)
   */

  getItems: function(keyword) {
    var requestURL =
      'https://www.homedepot.com/SearchNav/v2/pages/search?keyword=' + keyword;

    return new Promise(function(resolve, reject) {
      request(requestURL, function(error, response, body) {
        if (!error) {
          try {
            var parsedData = JSON.parse(body);
          } 
          catch (e) {
            console.log(e);
          }
          //console.log(parsedData);
          var items = [];
          //dont iterate array if no products returned
          if (parsedData.searchReport) {
            if (parsedData.searchReport.totalProducts > 0) {
              for (let i = 0; i < parsedData.skus.length; i++) {
                //add items to array
                items.push(parsedData.skus[i]);
              }

              //return array
              resolve(items);
            }
          }
        } else {
          console.log('error', error);
        }
      }); //request
    }); //promise
  }, //function getItems
  
  /**Update items in inventory
   * @params sql - sql string
   * @params sqlParams - array with product values
   * @return array with items
   */

  updateItems: function(sql, sqlParams) {
    
    return new Promise(function(resolve, reject) {
      let connection = module.exports.createConnection();
      
      connection.connect(function(err) {
        if (err) throw err;
        connection.query(sql, sqlParams, function(err, rows, fields) {
          if (err) throw err;
          //console.log("rows found:" + rows.length);
          resolve(rows);
        }); //sql
      }); //connection
    }); //promise
  },
  
  /**display items from inventory
   * @params sql - sql string
   * @params sqlParams - array with product values
   * @return array with items
   */

  displayItems: function(sqlParams) 
  {
    let sql = "SELECT productID, imageURL, description, price "
    + "FROM products WHERE status = 1 AND keyword = ?";
  
    return new Promise(function(resolve, reject) {
      let connection = module.exports.createConnection();
      
      connection.connect(function(err) {
        if (err) throw err;
        connection.query(sql, sqlParams, function(err, rows, fields) {
          if (err) throw err;
          //console.log("rows found:" + rows.length);
          resolve(rows);
        }); //sql
      }); //connection
    }); //promise
  },

  /**Get only items in our DB
   * @return array with items
   */

  getDBItems: function() {
    let sql = 'SELECT * FROM products';
    return new Promise(function(resolve, reject) {
      let connection = module.exports.createConnection();
      connection.connect(function(err) {
        if (err) throw err;
        connection.query(sql, function(err, rows, fields) {
          if (err) throw err;
          //console.log("rows found:" + rows.length);
          resolve(rows);
        }); //sql
      }); //connection
    }); //promise
  },
  
  /**Display search items
   * @param sql -sql query string
   * @param sqlParams - sql query parameters
   * @return array with items
   */

  displaySearchItems: function(sql, sqlParams) {
    
    return new Promise(function(resolve, reject) {
      let connection = module.exports.createConnection();
      connection.connect(function(err) {
        if (err) throw err;
        connection.query(sql, sqlParams, function(err, rows, fields) {
          if (err) throw err;
          //console.log("rows found:" + rows.length);
          resolve(rows);
        }); //sql
      }); //connection
    }); //promise
  },

  /**check for valid username
   * @param string username
   * @return array with username and password
   */

  checkUsername: function(username) {
    let sql = 'SELECT username, password FROM users WHERE username = ?';
    return new Promise(function(resolve, reject) {
      let connection = module.exports.createConnection();
      connection.connect(function(err) {
        if (err) throw err;
        connection.query(sql, [username], function(err, rows, fields) {
          if (err) throw err;
          //console.log("rows found:" + rows.length);
          resolve(rows);
        }); //sql
      }); //connection
    }); //promise
  },

  /**check for valid password
   * @param string password - user entered password
   * @param string hashedValue - password hash from database
   * @return boolean
   */

  checkPassword: function(password, hashedValue) {
    return new Promise(function(resolve, reject) {
      //console.log("hash: " + hashedValue);
      bcrypt.compare(password, hashedValue, function(err, result) {
        if (err) throw err;
        //console.log("Results:" + result);
        resolve(result);
      }); // compare
    }); // promise
  },
  
   /**show keywords for viewing inventory
   * @param (none)
   * @return object arrary
   */
  
  getKeywords: function(productID) 
  {
    var sql =
    'SELECT DISTINCT keyword FROM products WHERE status = 1 ORDER BY keyword';
  
    return new Promise(function(resolve, reject) {
      let connection = module.exports.createConnection();
      connection.connect(function(err) {
        if (err) throw err;
        connection.query(sql, function(err, rows, fields) {
          if (err) throw err;
          //console.log("rows found:" + rows.length);
          resolve(rows);
        }); //sql
      }); //connection
    }); //promise
  },
  
  
   /**lookup items for editing
   * @param string productID - admin entered productID
   * @return object arrary
   */
  
  lookupItem: function(productID) 
  {
    var sql = 'SELECT productID, description, imageURL, keyword FROM products WHERE productID = ?';
  
    return new Promise(function(resolve, reject) {
      let connection = module.exports.createConnection();
      connection.connect(function(err) {
        if (err) throw err;
        connection.query(sql, [productID], function(err, rows, fields) {
          if (err) throw err;
          //console.log("rows found:" + rows.length);
          resolve(rows);
        }); //sql
      }); //connection
    }); //promise
  },

  /**get item prices for administration reports
   * @param (none)
   * @return object arrary
   */
  
  getPrices: function() 
  {
    var sql =
    "SELECT IFNULL(`keyword`,'TOTAL') as 'Category', CONCAT('$', FORMAT(min(price),2)) as 'Minimum', " +
    "COUNT(keyword) as 'Count', CONCAT('$', FORMAT(max(price),2)) as 'Maximum', " +
    "CONCAT('$', FORMAT(avg(price),2)) as 'Average' FROM products WHERE status = 1 " +
    'GROUP by keyword WITH ROLLUP';
  
    return new Promise(function(resolve, reject) {
      let connection = module.exports.createConnection();
      connection.connect(function(err) {
        if (err) throw err;
        connection.query(sql, function(err, rows, fields) {
          if (err) throw err;
          //console.log("rows found:" + rows.length);
          resolve(rows);
        }); //sql
      }); //connection
    }); //promise
  },
  
    /**get orders for administration reports
   * @param (none)
   * @return object arrary
   */
  
  getOrders: function() 
  {
    var sql = "SELECT IFNULL(orderID, 'TOTAL') as 'orderNumber',"
      + "CONCAT('$', FORMAT(SUM(total_price),2)) as 'invoiceTotal' "
      + "FROM `line items` GROUP BY orderID WITH ROLLUP";
  
    return new Promise(function(resolve, reject) {
      let connection = module.exports.createConnection();
      connection.connect(function(err) {
        if (err) throw err;
        connection.query(sql, function(err, rows, fields) {
          if (err) throw err;
          //console.log("rows found:" + rows.length);
          resolve(rows);
        }); //sql
      }); //connection
    }); //promise
  },
  
  /**get item count for administration reports
   * @param (none)
   * @return object arrary
   */
  
  getItemCount: function() 
  {
    var sql =
    "SELECT count(*) as 'total' FROM products" +
    " UNION SELECT count(*) as 'activeTotal' from products WHERE status = 1" +
    " UNION SELECT count(*) as 'inactiveTotal' from products WHERE status = 0";
  
    return new Promise(function(resolve, reject) {
      let connection = module.exports.createConnection();
      connection.connect(function(err) {
        if (err) throw err;
        connection.query(sql, function(err, rows, fields) {
          if (err) throw err;
          //console.log("rows found:" + rows.length);
          resolve(rows);
        }); //sql
      }); //connection
    }); //promise
  },

  /**check for session authentication
   * @param string req
   * @param string res
   * @param string next
   */

  isAuthenticated: function(req, res, next) {
    if (!req.session.authenticated) {
      res.redirect('/');
    } else {
      next();
    }
  }
}; //modules
