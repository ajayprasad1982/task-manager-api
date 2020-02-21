const mongoose=require('mongoose')


mongoose.connect(process.env.MONGODB_URL,{
      useNewUrlParser:true,
      useCreateIndex:true,
      useFindAndModify:false,
      useUnifiedTopology: true

})

// const me=new User({
//      name:'   Khushi1993 ',
//      email:'KHUSHI@gmail.com  ',
//      password:'login1-2'
// })

// me.save().then(()=>{
// console.log(me)
// }).catch((e)=>{
// console.log(e)
// })

