const request = require("request");
const mysql = require("mysql");
const bcrypt = require("bcrypt-nodejs");

module.exports = 
{
    
    /**Return product info from API
     * @param string keyword - search term
     * @param int imageCount - number of random images
     * @return array of product info (description, price, imageURL)
     */
  
    getItems: function(keyword)
    {
        var requestURL = "https://www.homedepot.com/SearchNav/v2/pages/search?keyword=" 
            + keyword;
        
        return new Promise(function(resolve,reject)
        {
            request(requestURL, function (error, response, body) 
            {
           
                if(!error)
                {
                    var parsedData = JSON.parse(body);
                    //console.log(parsedData);
                    var items = [];
                    //dont iterate array if no products returned
                    if (parsedData.searchReport)
                    {
                        if (parsedData.searchReport.totalProducts > 0)
                        {
                            for (let i=0;i < parsedData.skus.length ;i ++)
                            {
                                //add items to array
                                items.push(parsedData.skus[i]);
                            }
                        
                            //return array
                            resolve(items);
                        }
                    }
                }
                else
                {
                   console.log("error", error);
                }
            }); //request
        }); //promise
    }, //function getItems
    
    //function to connect to database
    createConnection: function()
    {
        var connection = mysql.createConnection(
        {
            host: 'cst336final.mysql.database.azure.com',
            user: 'dbadmin@cst336final',
            password: 'Otter2020!',
            database: 'eStore',
            port: 3306
        });
        
         //handle errors during connection
        connection.on('error', function(err) 
        {
            console.log(err.code);
        });
 
        return connection;
    }, //createConnection
    
    /**check for valid username
     * @param string username
     * @return array with username and password
     */
    
    checkUsername: function(username)
    {
        let sql = "SELECT username, password FROM users WHERE username = ?";
        return new Promise(function(resolve,reject)
        {
            let connection = module.exports.createConnection();
            connection.connect(function(err)
            {
                if(err) throw err;
                connection.query(sql, [username], function(err,rows,fields)
                {
                    if(err) throw err;
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
    
    checkPassword: function(password, hashedValue)
    {
        return new Promise(function(resolve, reject)
        {
            //console.log("hash: " + hashedValue);
            bcrypt.compare(password, hashedValue, function(err, result)
            {
                if(err) throw err;
                //console.log("Results:" + result);
                resolve(result);
            }); // compare
        }); // promise
    },
   
    /**check for session authentication 
     * @param string req
     * @param string res
     * @param string next
     */
     
    isAuthenticated: function(req, res, next)
    {
        if(!req.session.authenticated)
        {
            res.redirect("/");
        }
        else
        {
            next();
        }
    },
    
}; //modules