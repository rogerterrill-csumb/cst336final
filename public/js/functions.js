/* global $ */

$(document).ready(function() {
  $(".favoriteIcon").on("click", function() {
    var description = $(this)
      .parent()
      .parent()
      .find("span:first")
      .text();
    var imageURL = $(this)
      .prev()
      .attr("src");
    var price = $(this)
      .parent()
      .next("span")
      .text();
    var productID = $(this)
      .parent()
      .next("span")
      .next("span")
      .text();

    if ($(this).attr("src") == "img/checkbox_empty.png") {
      $(this).attr("src", "img/checkbox_full.png");
      //console.log(description);
      updateProduct(
        "add",
        parseInt(productID.replace("(", "")),
        imageURL,
        description,
        parseFloat(price.replace("$", ""))
      );
    } else {
      $(this).attr("src", "img/checkbox_empty.png");
      updateProduct("delete", parseInt(productID.replace("(", "")));
    }
  }); //favorite onClick

  $(".keywordLink").on("click", function() {
    $.ajax({
      method: "GET",
      url: "/api/displayItems",
      data: {
        keyword: $(this)
          .text()
          .trim()
      },
      success: function(rows, status) {
        //clear the previous results
        $("#favorites").html("");

        //add favorite images
        rows.forEach(function(row, i) {
          //add BR every four images
          (i % 3 == 0) & (i != 0)
            ? $("#favorites").append("<br>")
            : $("#favorites").append("");
          $("#favorites").append(
            "<div class='itemContainer'>" +
              "<span class=  'description' id='description'>" +
              row.description +
              "</span>" +
              "<div class = 'imageContainer'>" +
              "<img class= 'image' src='" +
              row.imageURL +
              "' width='200' height='200'>" +
              "<img class= 'favoriteIcon' src='img/checkbox_full.png'>" +
              "</div>" +
              "<span class= 'itemPrice' id='itemPrice'>&dollar;" +
              row.price +
              "<br></span>" +
              "<span class= 'productID' id='productID'>(" +
              row.productID +
              ")</span>" +
              "</div>"
          );
        });

        //add listener to dynamic content
        $(".favoriteIcon").on("click", function() {
          var description = $(this)
            .parent()
            .parent()
            .find("span:first")
            .text();
          var imageURL = $(this)
            .prev()
            .attr("src");
          var price = $(this)
            .parent()
            .next("span")
            .text();
          var productID = $(this)
            .parent()
            .next("span")
            .next("span")
            .text();

          if ($(this).attr("src") == "img/checkbox_full.png") {
            $(this).attr("src", "img/checkbox_empty.png");
            console.log("pr: " + parseInt(productID.replace("(", "")));
            updateProduct("delete", parseInt(productID.replace("(", "")));
          } else {
            $(this).attr("src", "img/checkbox_full.png");
            updateProduct(
              "add",
              parseInt(productID.replace("(", "")),
              imageURL,
              description,
              parseFloat(price.replace("$", ""))
            );
          }
        }); //favorite onClick
      }
    });
  }); //keywordLink onClick

  function updateProduct(action, productID, imageURL, description, price) {
    $.ajax({
      method: "GET",
      url: "/api/updateItems",
      data: {
        productID: productID,
        imageURL: imageURL,
        description: description,
        price: price,
        keyword: $("#keyword").val(),
        action: action
      }
    });
  }

  $("#searchBtn").on("click", function() {
    $("#searchContainer").empty();
    $.ajax({
      method: "GET",
      url: "/api/displaySearchItems",
      data: {
        keyword: $("#type").val(),
        pricefrom: $("#pricefrom").val(),
        priceto: $("#priceto").val()
      },
      success: function(rows, status) {
        if (rows.length == 0) {
          $("#searchContainer").append(`<h1>Sorry there are no results</h1>`);
        } else {
          rows.forEach(function(item, i) {
            if (i % 4 == 0) {
              $("#searchContainer").append(`<br>`);
            }
            $("#searchContainer").append(`<div class="itemContainer">
          <form action="/cart" method="POST">
            <input type="hidden" name="product_id" value="${item.productID} />
            <input type="hidden" name="qty" value="1" />
            <input type="hidden" name="imageurl" value="${item.imageURL}" />
            <input type="hidden" name="description" value="${item.description}" />
            <input type="hidden" name="price" value="${item.price}" />
            <span class="description" id="description">${item.description}</span>
            <div class="imageContainer">
              <img class="image" src="${item.imageURL}" width="200" height="200" />
            </div>
            <span class="itemPrice" id="itemPrice"
              >&dollar;${item.price}<br
            /></span>
            <br />
            <button type="button">Add To Cart</button>
          </form>
        </div>
      `);
          });
        }
      }
    });
  });
}); //document ready
