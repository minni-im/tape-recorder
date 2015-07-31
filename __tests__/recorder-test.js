var recorder = require("..");
console.log("Testing recorder");

console.log(recorder.Schema);

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
