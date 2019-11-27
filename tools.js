const request = require("request");
const mysql = require("mysql");

module.exports = 
{
    
    /**Return random image URLs from API
     * @param string keyword - search term
     * @param int imageCount - number of random images
     * @return array of image URLs
     */
     
    getRandomImages_cb: function(keyword, imageCount, callback)
    {
        var requestURL = "https://api.unsplash.com/photos/random?query=" + keyword
            + "&count=" + imageCount + "&orientation=landscape"
            + "&client_id=d46d13111e60d1506a3a232ff6e8ff3e3a929489a65b2fa6c55c515e4704a666";
        
        request(requestURL, function (error, response, body)
        {
       
            if(!error)
            {
                var parsedData = JSON.parse(body);
                var imageURLs = [];
                for (let i=0;i < imageCount;i ++)
                {
                    imageURLs.push(parsedData[i].urls.regular);
                }
            
                callback(imageURLs);
            }
            else
            {
               console.log("error", error);
            }
        }); //request
    }, //function getRandomImages WITH comma
    
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
    }, //function getRandomImages
    
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
        
        
        
        return connection;
    } //createConnection
    
}; //modules