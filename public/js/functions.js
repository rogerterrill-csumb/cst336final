/* global $ */

$(document).ready(function()
{
    $(".favoriteIcon").on("click", function()
    {
        
        var description = $(this).parent().parent().find('span:first').text();
        var imageURL = $(this).prev().attr("src");
        var price = $(this).parent().next('span').text();
        var productID = $(this).parent().next('span').next('span').text();
        
        if ($(this).attr("src") == "img/checkbox_empty.png")
        {
            $(this).attr("src","img/checkbox_full.png");
            //console.log(description);
            updateProduct("add", parseInt(productID.replace("(","")), imageURL, description, parseFloat(price.replace("$","")));
        }
        else
        {
            $(this).attr("src","img/checkbox_empty.png");
           updateProduct("delete", parseInt(productID.replace("(","")));
        }
        
    }); //favorite onClick  
    
    $(".keywordLink").on("click", function()
    {
        $.ajax(
        {
            method: "GET",
            url:    "/api/displayItems",
            data:   { 
                        "keyword": $(this).text().trim(),
                    },
            success: function(rows, status)
                    {
                        //clear the previous results
                        $("#favorites").html("");
                        
                        //add favorite images
                        rows.forEach(function(row, i)
                        {
                            //add BR every four images
                            (i%3==0 & i!=0)?$("#favorites").append('<br>'):$("#favorites").append('');
                            $("#favorites").append("<div class='itemContainer'>"
                                + "<span class=  'description' id='description'>" + row.description + "</span>"
                                + "<div class = 'imageContainer'>"
                                + "<img class= 'image' src='" + row.imageURL + "' width='200' height='200'>"
                                + "<img class= 'favoriteIcon' src='img/checkbox_full.png'>"
                                + "</div>"
                                + "<span class= 'itemPrice' id='itemPrice'>&dollar;" + row.price + "<br></span>"
                                + "<span class= 'productID' id='productID'>(" + row.productID + ")</span>"
                                + "</div>"
                            );
                        });
                        
                        //add listener to dynamic content
                        $(".favoriteIcon").on("click", function()
                                {
                                    var description = $(this).parent().parent().find('span:first').text();
                                    var imageURL = $(this).prev().attr("src");
                                    var price = $(this).parent().next('span').text();
                                    var productID = $(this).parent().next('span').next('span').text();
        
                                    if ($(this).attr("src") == "img/checkbox_full.png")
                                    {
                                        $(this).attr("src","img/checkbox_empty.png");
                                        console.log("pr: " + parseInt(productID.replace("(","")));
                                        updateProduct("delete", parseInt(productID.replace("(","")));
                                    }
                                    else
                                    {
                                        $(this).attr("src","img/checkbox_full.png");
                                        updateProduct("add", parseInt(productID.replace("(","")), imageURL, description, parseFloat(price.replace("$","")));
                                    }
                                    
                        }); //favorite onClick  
                    }
        });
        
    }); //keywordLink onClick
    
    $('#searchBtn').on('click', function() {
      $('#searchContainer').empty();
      $.ajax({
        method: 'GET',
        url: '/api/displaySearchItems',
        data: {
          keyword: $('#type').val(),
          pricefrom: $('#pricefrom').val(),
          priceto: $('#priceto').val(),
          description: $('#description').val()
        },
        success: function(rows, status) {
          if (rows.length == 0) {
            $('#searchContainer').append(`<h1>Sorry there are no results</h1>`);
          } else {
            rows.forEach(function(item, i) {
              if (i % 4 == 0) {
                $('#searchContainer').append(`<br>`);
              }
              $('#searchContainer').append(`<div class="itemContainer">
                <form>
                  <input type="hidden" name="product_id" value="${item.productID}" />
                  <input type="hidden" name="imageurl" value="${item.imageURL}" />
                  <input type="hidden" name="description" value="${item.description}" />
                  <input type="hidden" name="price" value="${item.price}" />
                  <span class="description" id="description">${item.description}</span>
                  <div class="imageContainer">
                    <img class="image" src="${item.imageURL}" width="200" height="200" />
                  </div>
                  <span class="itemPrice" id="itemPrice">&dollar;${item.price}<br/></span>
                  <br />
                  <button type="button" class="add-to-cart">Add To Cart</button>
                </form>
              </div>
            `);
            });
            $('.add-to-cart').on('click', function() {
              let currentItem = $(this)
                .parent()
                .children();
              let id = $(currentItem[0]).val();
              let imageURL = $(currentItem[1]).val();
              let description = $(currentItem[2]).val();
              let price = $(currentItem[3]).val();
  
              $.ajax({
                method: 'GET',
                url: '/cart',
                data: {
                  id: id,
                  imageURL: imageURL,
                  description: description,
                  price: price
                }
              });
            });
          }
        }
      });
    });
  
    $('.updateBtn').on('click', function() {
      let newQty = $(this)
        .parent()
        .prev()
        .find('input')
        .val();
      let id = parseInt(
        $(this)
          .parent()
          .prev()
          .prev()
          .prev()
          .prev()
          .text()
      );
      $.ajax({
        method: 'GET',
        url: '/checkoutupdate',
        data: { id, newQty },
        success: function() {
          location.reload(true);
        }
      });
    });
  
    $('.removeBtn').on('click', function() {
      let id = parseInt(
        $(this)
          .parent()
          .prev()
          .prev()
          .prev()
          .prev()
          .prev()
          .text()
      );
      $.ajax({
        method: 'GET',
        url: '/checkoutremove',
        data: { id },
        success: function() {
          location.reload(true);
        }
      });
    });
  
    $('#submitBtn').on('click', function() {
      $.ajax({
        method: 'GET',
        url: '/checkoutsubmit',
        success: function() {
          location.reload(true);
        }
      });
    });
  
    $.ajax({
      method: 'GET',
      url: '/api/keywords',
      success: function(result, status) {
        result.forEach(function(element) {
          $('#type').append(
            '<option value="' +
              element.keyword +
              '">' +
              element.keyword.toUpperCase() +
              '</option>'
          );
        });
      }
    });
    
    function updateProduct(action, productID, imageURL, description, price)
    {
        $.ajax(
        {
            method: "GET",
            url:    "/api/updateItems",
            data:   {
                        "productID": productID,
                        "imageURL": imageURL,
                        "description": description,
                        "price": price,
                        "keyword": $("#keyword").val(),
                        "action": action
                    },
            
        });
    }
    
}); //document ready

function getItemCount()
{
    $.ajax(
    {
        method: "GET",
        url:    "/api/getItemCount",
        data:   {
                },
        success: function(result, status)
        {
            //clear the results and start table
            $("#totalResults").html("<table>");
            
            //show totals
            $("#totalResults").append("<table><tr><th>Total Products in Store:</th><td id='right'>" + result[0].total 
                + "</td></tr><tr><th>Active Products:</th><td id='right'>" + result[1].total
                + "</td></tr><tr><th>Inactive Products:</th><td id='right'>" + result[2].total + "</td></tr>");
                
             //end table
            $("#totalResults").append("</table>");
        }
    });
        
} //getItemCount

function getPrices()
{
    $.ajax(
    {
        method: "GET",
        url:    "/api/getPrices",
        data:   {
                },
        success: function(result, status)
        {
            //clear the results and start table
            $("#priceResults").html("<table id='priceTable'>");
            $("#priceResults").append("<tr><th>Category</th><th>Count</th><th>Minimum</th><th>Maximum</th><th>Average</th></tr>");
            
            //add favorite images
            result.forEach(function(row, i)
            {
                //show totals
                $("#priceResults").append("<tr><td>" + result[i].Category
                    + "</td><td id='right'>" + result[i].Count + "</td><td id='right'>" + result[i].Minimum
                    + "</td><td id='right'>" + result[i].Maximum + "</td><td id='right'>" + result[i].Average
                    + "</td></tr>");
            });
            
             //end table
            $("#priceResults").append("</table>");
            
        }
    });
        
} //getPrices

function getOrders()
{
    $.ajax(
    {
        method: "GET",
        url:    "/api/getOrders",
        data:   {
                },
        success: function(result, status)
        {
            //clear the results and start table
            $("#orderResults").html("<table id=‘orderTable’>");
            $("#orderResults").append("<tr><th>Order Number</th><th>Invoice Total</th></tr>");
            result.forEach(function(row, i)
            {
                //show order totals
                $("#orderResults").append("<tr><td>" + result[i].orderNumber
                    + "</td><td>" + result[i].invoiceTotal + "</td></tr>");
            });
             //end table
            $("#orderResults").append("</table>");
        }
    });
}//getOrders

function lookupItem()
{
    $.ajax(
    {
        method: "GET",
        url:    "/api/lookupItem",
        data:   {
                    "productID": $("#productID").val()
                },
        success: function(result, status)
        {
            //clear the results and start table
            $("#lookupResults").html("");
            $("#lookupResults").append(result[0].description + "<br>"
                + "<img src='" + result[0].imageURL + "' alt='image'><br>"
                + "<form><input type='text' value='" + result[0].keyword
                + "' name='keyword' id='keyword'><button name='update' onclick='updateItem(`" 
                + result[0].productID + "`)' id='update'>Update</button></form>"
            )

        }
    });
        
} //lookupItem

function updateItem(productID)
{
    $.ajax(
    {
        method: "GET",
        url:    "/api/updateItems",
        data:   {
                    "productID": productID,
                    "keyword": document.getElementById('keyword').value,
                    "action": "updateItem"
                },

    });
}