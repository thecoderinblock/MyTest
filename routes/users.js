var express = require('express');
var router = express.Router();

var mongoose = require('mongoose'); //mongo connection
var bodyParser = require('body-parser'); //parses information from POST
var methodOverride = require('method-override'); //used to manipulate POST


router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

//build the REST operations at the base for blobs
//this will be accessible from http://127.0.0.1:3000/blobs if the default route for / is left unchanged
router.route('/')
    //GET all blobs
    .get(function(req, res, next) {
        //retrieve all blobs from Monogo
        mongoose.model('User').find({}, function (err, users) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/blobs folder. We are also setting "blobs" to be an accessible variable in our jade view
                    html: function(){
                        res.render('users/index', {
                              title: 'All my Users',
                              "users" : users
                          });
                    },
                    //JSON response will show all blobs in JSON format
                    json: function(){
                        res.json(infophotos);
                    }
                });
              }
        });
    })
    //POST a new blob
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var name = req.body.name;
        var pass = req.body.pass;
        var dob = req.body.dob;
        var isActive = req.body.isActive;
        //call the create function for our database
        mongoose.model('User').create({
            name : name,
            pass : pass,
            dob : dob,
            isActive : isActive
        }, function (err, user) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //Blob has been created
                  console.log('POST creating new blob: ' + user);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("users");
                        // And forward to success page
                        res.redirect("/users");
                    },
                    //JSON response will show the newly created blob
                    json: function(){
                        res.json(user);
                    }
                });
              }
        })
    });
    /* GET New Blob page. */
    router.get('/new', function(req, res) {
        res.render('users/new', { title: 'Add New User' });
    });
    // route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('User').findById(id, function (err, user) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(blob);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
    });
});
router.route('/:id')
  .get(function(req, res) {
    mongoose.model('User').findById(req.id, function (err, user) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + user._id);
        var userdob = user.dob.toISOString();
        userdob = userdob.substring(0, userdob.indexOf('T'))
        res.format({
          html: function(){
              res.render('users/show', {
                "userdob" : userdob,
                "user" : user
              });
          },
          json: function(){
              res.json(user);
          }
        });
      }
    });
  });
  //GET the individual blob by Mongo ID
  router.get('/:id/edit', function(req, res) {
      //search for the blob within Mongo
      mongoose.model('User').findById(req.id, function (err, user) {
          if (err) {
              console.log('GET Error: There was a problem retrieving: ' + err);
          } else {
              //Return the blob
              console.log('GET Retrieving ID: ' + user._id);
              //format the date properly for the value to show correctly in our edit form
            var userdob = user.dob.toISOString();
            userdob = userdob.substring(0, userdob.indexOf('T'))
              res.format({
                  //HTML response will render the 'edit.jade' template
                  html: function(){
                         res.render('users/edit', {
                            title: 'Blob' + user._id,
                          "userdob" : userdob,
                            "user" : user
                        });
                   },
                   //JSON response will return the JSON output
                  json: function(){
                         res.json(user);
                   }
              });
          }
      });
  });
  //PUT to update a blob by ID
router.put('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var name = req.body.name;
    var pass = req.body.pass;
    var dob = req.body.dob;
    var isActive = req.body.isActive;

   //find the document by ID
        mongoose.model('User').findById(req.id, function (err, user) {
            //update it
            user.update({
                name : name,
                pass : pass,
                dob : dob,
                isActive : isActive
            }, function (err, userID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              }
              else {
                      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                      res.format({
                          html: function(){
                               res.redirect("/users/" + user._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(user);
                         }
                      });
               }
            })
        });
});
//DELETE a Blob by ID
router.delete('/:id/edit', function (req, res){
    //find blob by ID
    mongoose.model('User').findById(req.id, function (err, user) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            user.remove(function (err, user) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + user._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                          html: function(){
                               res.redirect("/users");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : user
                               });
                         }
                      });
                }
            });
        }
    });
});
module.exports = router;
