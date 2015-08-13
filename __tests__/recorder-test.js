
var recorder = require("..");
var Schema = recorder.Schema;


recorder.connect("http://localhost:5984", "minni");

var UserSchema = new Schema({
  firstName: String,
  lastName: String
});

UserSchema.view("fullname", {
  map: 'function(doc) {\
    if (doc.modelType === "User" && doc.firstName && doc.lastName) {\
      emit([doc.lastName, doc.firstName], doc);\
    }\
  }'
});

var User = recorder.model("User", UserSchema);

console.log(User);
console.log("==============================================");
var user = new User({
  firstName: "Benoit",
  lastName: "Charbonnier"
});

console.log(user);

// recorder.connect("http://localhost:5984", "minni", function() {
//   var User = recorder.model("User", {
//     firstName: "string",
//     lastName: "string"
//   });
//
//   User.addMethod("fullName", function() {
//     return this.firstName + " " + this.lastName;
//   });
//
//   User.beforeCreate(function(user) {
//     console.log("I am %s and I am about to be created!", user.firstName);
//   });
//
//   User.beforeSave(function(user) {
//     console.log("I am %s and I am about to be saved!", user.firstName);
//   });
//
//   User.afterSave(function(user) {
//     console.log("I am %s and I have been saved!", user.firstName);
//   });
//
//   var me = User.create({
//     firstName: "Benoit",
//     lastName: "Charbonnier"
//   });
//
//   me.save(function(error, user) {
//     if (!error) {
//       console.log("New user saved", user.fullName());
//     }
//   });
//
// });
