const express = require("express");
const request = require("request");
const app = express();
const tools = require("./tools.js");
const session = require("express-session");

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(session(
    {
        secret: "Z1BbyuR6LWG6Rehi9oxj",
        resave: true,
        saveUninitialized: true
    }));
app.use(express.urlencoded({extended: true}));

//ROUTES

//root route
app.get("/", function(req,res)
{
    res.render("index.ejs");
});

//login route
app.get("/login", function(req,res)
{
    res.render("login.ejs");
});

//logout route
app.get("/logout", function(req,res)
{
    req.session.destroy();
    res.redirect("/");
});

//administration page route
app.get("/admin", tools.isAuthenticated, function(req,res)
{
    res.render("admin.ejs");
});

//product search route
app.get("/productSearch", tools.isAuthenticated, function(req,res)
{
    res.render("productSearch.ejs");
});

//keyword search route
app.get("/search", tools.isAuthenticated, async function(req,res)
{
    var keyword = req.query.keyword;
    
    //promise method
    if(keyword != "")
    {
        var items =[];
        items = await tools.getItems(keyword);
        //console.log("items " + items);
        res.render("results.ejs",{"items":items, "keyword": keyword});
    }

}); //search

//update database route
app.get("/api/updateItems", tools.isAuthenticated, function(req, res)
{
    var connection = tools.createConnection();
    
    if(req.query.action == "add")
    {
        var sql = "INSERT INTO products(productID, imageURL, description, price,"
            + " keyword) VALUES(?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = 1";
        
        //console.log("pr" + req.query.productID);
        var sqlParams = [req.query.productID, req.query.imageURL,req.query.description,req.query.price, req.query.keyword];
    }
    else
    {
        // set status = 0 if deselected (deleted)
        var sql = "UPDATE products SET status = 0 WHERE productID = ?";
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
}); //update items

//display keyword route
app.get("/displayKeywords", tools.isAuthenticated, async function(req, res)
{
    //var imageURLs = await tools.getRandomImages("",1);
    var connection = tools.createConnection();
    var sql = "SELECT DISTINCT keyword FROM products WHERE status = 1 ORDER BY keyword";
    
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

//display items route
app.get("/api/displayItems", tools.isAuthenticated, function(req, res)
{
    var connection = tools.createConnection();
    var sql = "SELECT productID, imageURL, description, price FROM products WHERE status = 1 AND keyword = ?";
    var sqlParams = [req.query.keyword];
    
    connection.connect(function(error)
    {
        if (error) throw error;
        try
            {
            connection.query(sql, sqlParams, function(err, results)
            {
                if (err) throw err;
                res.send(results);
            }); //query
        }
        catch(err)
            {
                console.log(err);
            }
        
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
        //eg 'connections closed without response',ECONNRESET, ...
        connection.on('close', function(err) 
        {
            console.log(err.code);
        });

    }); //connect
    
}); //displayKeywords

//login submission route
app.post("/login", async function(req, res)
{
    let username = req.body.username;
    let password = req.body.password;
    
    let result = await tools.checkUsername(username);
    console.dir(result);
    let hashedPassword = "";
    
    if(result.length > 0)
    {
        hashedPassword = result[0].password;
    }
    
    let passwordMatch = await tools.checkPassword(password, hashedPassword);
    console.log("Password match:" + passwordMatch);
    
    if(passwordMatch)
    {
        req.session.authenticated = true;
        res.render("admin.ejs");
    }
    else
    {
        console.log("password did not match");
        res.render("login.ejs",{"loginError":true});
    }
    
}); //post login

//server listener
app.listen(process.env.PORT,process.env.IP, function()
{
    console.log("Express server is running...");
});
