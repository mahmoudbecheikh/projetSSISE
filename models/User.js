const mongoose = require('mongoose');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  displayName: {
    type: String,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },

  adresse: {
    type: String
  },

  codeP: {
    type: String
  },

  role: {
    type: Number, default: 2
  }
  ,

  passwordToken : String,
  passwordTokenExpire : Date
  
  
})


UserSchema.methods.CreatePasswordToken = function(){
  const token = crypto.randomBytes(32).toString('hex') ; 

  this.passwordToken =  crypto.createHash('sha256').update(token).digest('hex');

  this.passwordTokenExpire = Date.now()+10*60*1000 ;

  return token ; 

};


const User = mongoose.model('User', UserSchema);


module.exports = User