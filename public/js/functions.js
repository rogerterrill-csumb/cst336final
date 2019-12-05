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
                + "<form><input type='text' placeholder='" + result[0].keyword
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