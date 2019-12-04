const express = require("express");
const request = require("request");
const app = express();
const tools = require("./tools.js");
const session = require("express-session");

const Cart = require("./public/js/Cart");

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(
  session({
    secret: "Z1BbyuR6LWG6Rehi9oxj",
    resave: true,
    saveUninitialized: true
  })
);
app.use(express.urlencoded({ extended: true }));

//ROUTES

//root route
app.get("/", function(req, res) {
  if (!req.session.cart) {
    req.session.cart = {
      items: [],
      totals: 0.0,
      formattedTotals: ""
    };
  }
  res.render("index.ejs");
});

//login route
app.get("/login", function(req, res) {
  res.render("login.ejs");
});

//logout route
app.get("/logout", function(req, res) {
  req.session.destroy();
  res.redirect("/");
});

//administration page route
app.get("/admin", tools.isAuthenticated, function(req, res) {
  res.render("admin.ejs");
});

//product search route
app.get("/productSearch", tools.isAuthenticated, function(req, res) {
  res.render("productSearch.ejs");
});

//keyword search route
app.get("/search", tools.isAuthenticated, async function(req, res) {
  var keyword = req.query.keyword;

  //promise method
  if (keyword != "") {
    var items = [];
    items = await tools.getItems(keyword);
    //console.log("items " + items);
    res.render("results.ejs", { items: items, keyword: keyword });
  }
}); //search

//shop route
app.get("/shop", async function(req, res) {
  //promise method
  var items = [];
  items = await tools.getDBItems();
  // console.log("items " + items);
  res.render("shop.ejs", { items: items });
}); //search

app.post("/shop", function(req, res) {
  var connection = tools.createConnection();
  let description = req.body.description;
  let type = req.body.type;
  let pricefrom = req.body.pricefrom || 0;
  let priceto = req.body.pricetoo || 10000;
  console.log("Type", type);

  var sql =
    "SELECT * FROM products WHERE description LIKE ? AND price BETWEEN ? AND ?";
  var sqlParams = [description, pricefrom, priceto];

  connection.connect(function(error) {
    if (error) throw error;
    try {
      connection.query(sql, sqlParams, function(err, results) {
        if (err) throw err;
        console.log(results);
        res.send(results);
      }); //query
    } catch (err) {
      console.log(err);
    }

    //handle errors during connection
    //eg 'PROTOCOL_CONNECTION_LOST'
    connection.on("error", function(err) {
      console.log(err.code);
    });

    //handle errors for end of connection
    //eg. ER_TOO_MANY_USER_CONNECTIONS:
    connection.end(function(err) {
      if (err) {
        console.log(err.message);
      }
    });

    //handle errors for closed connection
    //eg 'connections closed without response',ECONNRESET, ...
    connection.on("close", function(err) {
      console.log(err.code);
    });
  }); //connect
  // res.redirect("/shop");
});

// Post to cart
app.post("/cart", function(req, res) {
  let qty = parseInt(req.body.qty);
  let prod = {
    id: req.body.product_id,
    imageURL: req.body.imageurl,
    description: req.body.description,
    price: req.body.price
  };

  let cart = req.session.cart;

  Cart._addToCart(prod, qty, cart);
  console.log(prod, qty, cart);
  res.redirect("/shop");
});

//update database route
app.get("/api/updateItems", tools.isAuthenticated, function(req, res) {
  var connection = tools.createConnection();

  if (req.query.action == "add") {
    var sql =
      "INSERT INTO products(productID, imageURL, description, price, keyword) VALUES(?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = 1";

    //console.log("pr" + req.query.productID);
    var sqlParams = [
      req.query.productID,
      req.query.imageURL,
      req.query.description,
      req.query.price,
      req.query.keyword
    ];
  } else {
    // set status = 0 if deselected (deleted)
    var sql = "UPDATE products SET status = 0 WHERE productID = ?";
    var sqlParams = [req.query.productID];
  }

  connection.connect(function(error) {
    if (error) throw error;
    connection.query(sql, sqlParams, function(err, result) {
      if (error) throw err;
    }); //query

    //handle errors during connection
    //eg 'PROTOCOL_CONNECTION_LOST'
    connection.on("error", function(err) {
      console.log(err.code);
    });

    //handle errors for end of connection
    //eg. ER_TOO_MANY_USER_CONNECTIONS:
    connection.end(function(err) {
      if (err) {
        console.log(err.message);
      }
    });
  }); //connect

  res.send("It works.");
}); //update items

//display keyword route
app.get("/displayKeywords", tools.isAuthenticated, async function(req, res) {
  //var imageURLs = await tools.getRandomImages("",1);
  var connection = tools.createConnection();
  var sql =
    "SELECT DISTINCT keyword FROM products WHERE status = 1 ORDER BY keyword";

  connection.connect(function(error) {
    if (error) throw error;
    connection.query(sql, function(err, result) {
      if (err) throw err;
      res.render("selectedProducts", { rows: result });
    }); //query

    //handle errors during connection
    //eg 'PROTOCOL_CONNECTION_LOST'
    connection.on("error", function(err) {
      console.log(err.code);
    });

    //handle errors for end of connection
    //eg. ER_TOO_MANY_USER_CONNECTIONS:
    connection.end(function(err) {
      if (err) {
        console.log(err.message);
      }
    });
  }); //connect
}); //displayKeywords

//display items route
app.get("/api/displayItems", tools.isAuthenticated, function(req, res) {
  var connection = tools.createConnection();
  var sql =
    "SELECT productID, imageURL, description, price FROM products WHERE status = 1 AND keyword = ?";
  var sqlParams = [req.query.keyword];

  connection.connect(function(error) {
    if (error) throw error;
    try {
      connection.query(sql, sqlParams, function(err, results) {
        if (err) throw err;
        res.send(results);
      }); //query
    } catch (err) {
      console.log(err);
    }

    //handle errors during connection
    //eg 'PROTOCOL_CONNECTION_LOST'
    connection.on("error", function(err) {
      console.log(err.code);
    });

    //handle errors for end of connection
    //eg. ER_TOO_MANY_USER_CONNECTIONS:
    connection.end(function(err) {
      if (err) {
        console.log(err.message);
      }
    });

    //handle errors for closed connection
    //eg 'connections closed without response',ECONNRESET, ...
    connection.on("close", function(err) {
      console.log(err.code);
    });
  }); //connect
}); //displayKeywords

//display items route
app.get("/api/displaySearchItems", function(req, res) {
  var connection = tools.createConnection();
  let description = req.query.description || "";
  let keyword = req.query.keyword;
  let pricefrom = req.query.pricefrom || 0;
  let priceto = req.query.priceto || 1000;
  var sql =
    "SELECT * FROM products WHERE keyword LIKE ? AND description LIKE %?% AND price BETWEEN ? AND ?";
  var sqlParams = [keyword, description, pricefrom, priceto];

  connection.connect(function(error) {
    if (error) throw error;
    try {
      connection.query(sql, sqlParams, function(err, results) {
        if (err) throw err;
        console.log(results);
        res.send(results);
      }); //query
    } catch (err) {
      console.log(err);
    }

    //handle errors during connection
    //eg 'PROTOCOL_CONNECTION_LOST'
    connection.on("error", function(err) {
      console.log(err.code);
    });

    //handle errors for end of connection
    //eg. ER_TOO_MANY_USER_CONNECTIONS:
    connection.end(function(err) {
      if (err) {
        console.log(err.message);
      }
    });

    //handle errors for closed connection
    //eg 'connections closed without response',ECONNRESET, ...
    connection.on("close", function(err) {
      console.log(err.code);
    });
  }); //connect
}); //displayKeywords

//login submission route
app.post("/login", async function(req, res) {
  let username = req.body.username;
  let password = req.body.password;

  let result = await tools.checkUsername(username);
  console.dir(result);
  let hashedPassword = "";

  if (result.length > 0) {
    hashedPassword = result[0].password;
  }

  let passwordMatch = await tools.checkPassword(password, hashedPassword);
  console.log("Password match:" + passwordMatch);

  if (passwordMatch) {
    req.session.authenticated = true;
    res.render("admin.ejs");
  } else {
    console.log("password did not match");
    res.render("login.ejs", { loginError: true });
  }
}); //post login

//server listener
app.listen(process.env.PORT || 8084, process.env.IP || "127.0.0.1", function() {
  console.log("Express server is running...");
});
