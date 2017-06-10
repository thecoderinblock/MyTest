var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
  name: String,
  pass: String,
  dob: { type: Date, default: Date.now },
  isAdmin: Boolean
});
mongoose.model('User', userSchema);
