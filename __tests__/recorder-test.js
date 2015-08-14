
var recorder = require("..");
var Schema = recorder.Schema;


recorder.connect("http://localhost:5984", "minni", function() {
  var UserSchema = new Schema({
    firstName: String,
    lastName: String
  });

  UserSchema
    .view("fullName", {
      map: function(doc) {
        if (doc.modelType === "User" && doc.firstName && doc.lastName) {
          emit([doc.lastName, doc.firstName], doc);
        }
      }
    })
    .method("fullName", function() {
      return this.firstName + " " + this.lastName;
    });

  var User = recorder.model("User", UserSchema);

  // var user = new User({
  //   firstName: "Benouat",
  //   lastName: "Carbonaro"
  // });
  //
  // user.save().then(function(savedUser) {
  //   console.log("Hello there! I'm " + savedUser.fullName());
  // });

  User.findAll().then(function(users) {
    console.log(users);
  }).catch(function(err) {
    console.error("not working", err);
  });
});
