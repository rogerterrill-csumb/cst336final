const express = require('express');
const request = require('request');
const app = express();
const tools = require('./tools.js');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const Cart = require('./public/js/Cart');

var options = {
  host: 'cst336final.mysql.database.azure.com',
  port: 3306,
  user: 'dbadmin@cst336final',
  password: 'Otter2020!',
  database: 'eStore'
};

var sessionStore = new MySQLStore(options);

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(session(
    {
    secret: "Z1BbyuR6LWG6Rehi9oxj",
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    cookie: { maxAge: 180000 }
  }));
app.use(express.urlencoded({extended: true}));


//ROUTES

//root route
app.get('/', function(req, res) {
  if (!req.session.cart) {
    req.session.cart = {
      items: []
    };
  }
  res.render('index.ejs');
});

//login route
app.get('/login', function(req, res) {
  res.render('login.ejs');
});

//logout route
app.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

//administration page route
app.get('/admin', tools.isAuthenticated, function(req, res) {
  res.render('admin.ejs');
});

//product search route
app.get('/productSearch', tools.isAuthenticated, function(req, res) {
  res.render('productSearch.ejs');
});

//product search route
app.get('/productUpdate', tools.isAuthenticated, function(req, res) {
  res.render('productUpdate.ejs');
});

//keyword search route
app.get('/search', tools.isAuthenticated, async function(req, res) {
  var keyword = req.query.keyword;

  //promise method
  if (keyword != '') {
    var items = [];
    items = await tools.getItems(keyword);
    //console.log("items " + items);
    res.render('results.ejs', { items: items, keyword: keyword });
  }
}); //search

//shop route
app.get('/shop', async function(req, res) {
  res.render('shop.ejs');
});

app.get('/checkout', function(req, res) {
  let items = req.session.cart.items;
  res.render('checkout.ejs', { items: items });
});

app.get('/checkoutupdate', function(req, res) {
  let id = req.query.id;
  let newQty = req.query.newQty;
  let cart = req.session.cart;

  Cart._updateCart(id, newQty, cart);
  res.redirect('/checkout');
});

app.get('/checkoutremove', function(req, res) {
  let id = req.query.id;
  let cart = req.session.cart;

  Cart._removeFromCart(id, cart);
  res.redirect('/checkout');;
});

app.get('/checkoutsubmit', function(req, res) {
  let connection = tools.createConnection();
  let cart = req.session.cart;
  let items = req.session.cart.items;
  items.forEach(item => {
    item.orderid = '@orderIDfromOrders';
  });
  console.log(items);
  let orderDate = Cart._formatTime(new Date());

  let sql = 'INSERT INTO orders (userID, order_Date) VALUES (?,?)';
  let sql2 = 'SET @orderIDFromOrders = "37"';
  let sql3 =
    'INSERT INTO `line items` (orderID, line_item_sequence, productID, total_price, item_description) VALUES ?';
  let sqlParams = [4, orderDate];
  let sqlParams2 = [
    ['@orderIDFromOrders', '1', '100291336', '18.69', 'sasdf'],
    ['@orderIDFromOrders', '2', '100291336', '18.69', 'adsfasd'],
    ['@orderIDFromOrders', '3', '100291336', '18.69', 'adsfasdf']
  ];

  connection.connect(function(error) {
    if (error) throw error;
    connection.query(sql, sqlParams, function(err, result) {
      if (error) throw err;
    }); //query
    connection.on('error', function(err) {
      console.log(err.code);
    });
    connection.query(sql2, function(err, result) {
      if (error) throw err;
    }); //query
    //handle errors during connection
    //eg 'PROTOCOL_CONNECTION_LOST'
    connection.on('error', function(err) {
      console.log(err.code);
    });

    connection.query(sql3, [sqlParams2], function(err, result) {
      if (error) throw err;
    }); //query
    //handle errors during connection
    //eg 'PROTOCOL_CONNECTION_LOST'
    connection.on('error', function(err) {
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

  Cart._emptyCart(cart);
  res.send('Successfully emptied cart');
});

// Post to cart
app.get('/cart', function(req, res) {
  let prod = {
    id: req.query.id,
    imageURL: req.query.imageURL,
    description: req.query.description,
    price: req.query.price,
    qty: 1
  };

  let cart = req.session.cart;

  Cart._addToCart(prod, cart);
  // console.log(prod, cart);
  res.redirect('/shop');
});

//add or update database items
app.get('/api/updateItems', tools.isAuthenticated, async function(req, res) {

  var action = req.query.action;

  if (req.query.action == 'add') {
    var sql =
      'INSERT INTO products(productID, imageURL, description, price,' +
      ' keyword) VALUES(?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = 1';

    var sqlParams = [
      req.query.productID,
      req.query.imageURL,
      req.query.description,
      req.query.price,
      req.query.keyword
    ];
  } else if (req.query.action == 'updateItem') {
    var sql = 'UPDATE products SET keyword = ? WHERE productID = ?';
    var sqlParams = [req.query.keyword, req.query.productID];
  } else {
    // set status = 0 if deselected (deleted)
    var sql = 'UPDATE products SET status = 0 WHERE productID = ?';
    var sqlParams = [req.query.productID];
  }

  let results = await tools.updateItems(sql, sqlParams);
   
  res.send('It works.');
}); //update items


//api keyword route
app.get('/api/keywords', async function(req, res) 
{
  let results = await tools.getKeywords();
  if(results.length > 0)
  {
    res.send(results);
  }
}); //api/Keywords

//display keyword route
app.get('/displayKeywords', async function(req, res) 
{
  let result = await tools.getKeywords();
  if(result.length > 0)
  {
     res.render('selectedProducts', { rows: result });
  }
}); //displayKeywords

//display items route
app.get('/api/displayItems', tools.isAuthenticated, async function(req, res) {
  
  var sqlParams = [req.query.keyword];
  let results = await tools.displayItems(sqlParams);
  if(results.length > 0)
  {
    res.send(results);
  }
}); //displayItems

//display items route
app.get('/api/displaySearchItems', async function(req, res) {
  
  let description = req.query.description ? `%${req.query.description}%` : '%%';
  let keyword = req.query.keyword;
  let pricefrom = req.query.pricefrom || 0;
  let priceto = req.query.priceto || 1000;
  var sql =
    "SELECT * FROM products WHERE keyword LIKE ? AND description LIKE ? AND price BETWEEN ? AND ?";
  var sqlParams = [keyword, description, pricefrom, priceto];

  let results = await tools.displaySearchItems(sql, sqlParams);
  if(results.length > 0)
  {
    res.send(results);
  }

}); //displaySearchItems

//send item count
app.get('/api/getItemCount', tools.isAuthenticated, async function(req, res) 
{
  let results = await tools.getItemCount();
  if(results.length > 0)
  {
    res.send(results);
  }
}); //function /api/getItemCount

//send prices
app.get('/api/getPrices', tools.isAuthenticated, async function(req, res) 
{
  let results = await tools.getPrices();
  if(results.length > 0)
  {
    res.send(results);
  }
}); //function /api/getPrices

//send orders
app.get('/api/getOrders', tools.isAuthenticated, async function(req, res) 
{
  let results = await tools.getOrders();
  if(results.length > 0)
  {
    res.send(results);
  }
}); //function

// lookup single item for editing
app.get('/api/lookupItem', tools.isAuthenticated, async function(req, res)
{
  var productID = [req.query.productID];
  
  let results = await tools.lookupItem(productID);
  if(results.length > 0)
  {
    res.send(results);
  }
  
}); //lookup item

//login submission route
app.post('/login', async function(req, res) {
  let username = req.body.username;
  let password = req.body.password;

  let result = await tools.checkUsername(username);
  //console.dir(result);
  let hashedPassword = '';

  if (result.length > 0) {
    hashedPassword = result[0].password;
  }

  let passwordMatch = await tools.checkPassword(password, hashedPassword);
  //console.log("Password match:" + passwordMatch);

  if (passwordMatch) {
    req.session.authenticated = true;
    res.render('admin.ejs');
  } else {
    console.log('password did not match');
    res.render('login.ejs', { loginError: true });
  }
}); //post login

// server listener
app.listen(process.env.PORT, process.env.IP, function() {
  console.log('Express server is running...');
});
