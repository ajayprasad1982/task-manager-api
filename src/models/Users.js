const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task=require('../models/Tasks')


const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
       type:String,
       unique:true,
       required:true,
       dropDups: true,
       trim:true,
       lowercase:true,
       validate(value)
       {
           if(!validator.isEmail(value))
             throw new Error('Email is Invalid');
       }
    },
    password:{
       type:String,
       required:[true,'password is mandatory'],
       minlength:[7,'minimum length of password should be 7'],
       validate(value)
       {
           if(value.toLowerCase().includes('password'))
           throw new Error("Password should not be  contain  'password'")
       }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0)
            throw new Error('Age must be positive number')
        }
    },
    tokens:[{
        token:{
            type:String,
            require:true
        }
}],
avatar:{
    type:Buffer
}        
},{
   timestamps:true 
})
userSchema.virtual('tasks',{
  ref:'Task',
  localField:'_id',
  foreignField:'owner'
})
// to hide the data i.e.password,token
userSchema.methods.toJSON=function (){
    const user = this
    const userObject=user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}
userSchema.statics.findByCredentials= (async (email,password)=>{
    const user=await User.findOne({email})
    if(!user)
     throw Error('Unable to login')
     const isMatch=await bcrypt.compare(password,user.password)
     if(!isMatch)
     throw Error('Unable to login')
     return user;
} )



userSchema.pre('save',async function(next){
    const user=this
    if(user.isModified('password'))
      {  
          user.password=await bcrypt.hash(user.password,8)

      }
    next()
   
})
//delete user tasks when user removed
userSchema.pre('remove',async function(next){
    const user=this
  await  Task.deleteMany({owner:user._id})
next()
})
const User=mongoose.model('User',userSchema);
module.exports=User