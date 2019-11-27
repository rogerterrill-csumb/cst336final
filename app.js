const express = require("express");
const app = express();
const request = require("request");
const mysql = require("mysql");
const tools = require("./tools.js");

app.set('view engine', 'ejs');
app.use(express.static("public"));

//ROUTES

//root route
app.get("/", function(req,res)
{
    //promise method
    //var items = await tools.getItems("",1);
    //console.log("start")
    res.render("index.ejs");
  
}); 

app.get("/productSearch", function(req,res)
{
    //promise method
    //var items = await tools.getItems("",1);
    //console.log("start")
    res.render("productSearch.ejs");
  
});

//search route
app.get("/search",async function(req,res)
{
    var keyword = req.query.keyword;
    
    
    /* callback method
        getRandomImages_cb(keyword, 9, function(imageURLs)
        {
            //console.log("imagesURLs " + imageURLs)
            res.render("results.ejs",{"imageURLs": imageURLs});
        }); */
    
    //promise method
    if(keyword != "")
    {
        var items =[];
        items = await tools.getItems(keyword);
        //console.log("items " + items);
        res.render("results.ejs",{"items":items, "keyword": keyword});
    }
   
    //console.log("items " + items);
    
      /*  {
            res.render("results.ejs",{"items":items, "keyword": keyword});
        } */
    //res.render("results.ejs",{"imageURLs": imageURLs, "keyword": keyword});
            
}); //search

//update database
app.get("/api/updateFavorites", function(req, res)
{
    var connection = tools.createConnection();
    
    if(req.query.action == "add")
    {
        var sql = "INSERT INTO products(productID, imageURL, description, price, keyword) VALUES(?, ?, ?, ?, ?)";
        
        //console.log("pr" + req.query.productID);
        var sqlParams = [req.query.productID, req.query.imageURL,req.query.description,req.query.price, req.query.keyword];
    }
    else
    {
        var sql = "DELETE FROM products where productID = ?";
        var sqlParams = [req.query.productID];
    }

    connection.connect(function(error)
    {
        if (error) throw error;
        connection.query(sql, sqlParams, function(err, result)
        {
            if (error) throw err;
        }); //query
        
        //handle errors during connection
        //eg 'PROTOCOL_CONNECTION_LOST'
        connection.on('error', function(err) 
        {
            console.log(err.code);
        });
        
        //handle errors for end of connection
        //eg. ER_TOO_MANY_USER_CONNECTIONS:
        connection.end(function(err) 
        {
            if(err)
            {
                console.log(err.message);
            }
        });
        
    }); //connect
    
    res.send("It works.");
}); //update favorites

//displayKeyword

app.get("/displayKeywords", async function(req, res)
{
    //var imageURLs = await tools.getRandomImages("",1);
    var connection = tools.createConnection();
    var sql = "SELECT DISTINCT keyword FROM products ORDER BY keyword";
    
    connection.connect(function(error)
    {
        if (error) throw error;
        connection.query(sql, function(err, result)
        {
            if (err) throw err;
            res.render("selectedProducts",{"rows": result});
        }); //query
    
        //handle errors during connection
        //eg 'PROTOCOL_CONNECTION_LOST'
        connection.on('error', function(err) 
        {
            console.log(err.code);
        });
        
        //handle errors for end of connection
        //eg. ER_TOO_MANY_USER_CONNECTIONS:
        connection.end(function(err) 
        {
            if(err)
            {
                console.log(err.message);
            }
        });
    
    }); //connect
    
}); //displayKeywords

app.get("/api/displayFavorites", function(req, res)
{
    var connection = tools.createConnection();
    var sql = "SELECT productID, imageURL, description, price FROM products WHERE keyword = ?";
    var sqlParams = [req.query.keyword];
    
    connection.connect(function(error)
    {
        if (error) throw error;
        connection.query(sql, sqlParams, function(err, results)
        {
            if (err) throw err;
            res.send(results);
        }); //query
        
        //handle errors during connection
        //eg 'PROTOCOL_CONNECTION_LOST'
        connection.on('error', function(err) 
        {
            console.log(err.code);
        });
        
        //handle errors for end of connection
        //eg. ER_TOO_MANY_USER_CONNECTIONS:
        connection.end(function(err) 
        {
            if(err)
            {
                console.log(err.message);
            }
        });
        
        //handle errors for closed connection
        //eg 'connections closed without response'
        connection.on('close', function(err) 
        {
            console.log(err.code);
        });

    }); //connect
    
}); //displayKeywords

//server listener
app.listen(process.env.PORT,process.env.IP, function()
{
    console.log("Express server is running...");
});
