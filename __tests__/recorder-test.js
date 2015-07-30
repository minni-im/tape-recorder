console.log("Testing recorder");
var recorder = require("../lib");

var conn = recorder.createConnection();
conn.on("connected", function() {
  console.log("Yay connected");
});
conn.open("http://localhost:5984", "user");
