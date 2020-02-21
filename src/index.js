const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter=require('./routers/task')
const Task = require("./models/Tasks");


const app = new express();

const port = process.env.PORT

// app.use((req,res,next)=>{

//     res.status(503).send({"warn":'Site is under maintainence mode'})
// })

app.use(express.json());
app.use(userRouter)
app.use(taskRouter)

const jwt=require('jsonwebtoken')
const multer=require('multer')
// const bcrypt=require('bcryptjs')
// const pass=async ()=>{
//     const passowrd='Red123!'
//     const hashpassword=await bcrypt.hash(passowrd,8)
//     console.log(hashpassword)
//     const isMatch=await bcrypt.compare(passowrd,hashpassword)
//     console.log(isMatch)
// }
// pass()
//const task=require('./models/Tasks')
const User=require('./models/Users')

const myFunction=async ()=>{
    // const token=jwt.sign({_id:'abc123'},'thisismynewcourse')
    // console.log(token)

    // const data =jwt.verify(token,'thisismynewcourse')
    // console.log(data)
    // const task=await Task.findById('5e4d153b00a87e35ec41a66c')
    // await task.populate('owner').execPopulate()
    // console.log(task.owner)
    //  const user=await User.findById('5e4d151700a87e35ec41a669')
    //  await user.populate('tasks').execPopulate()
    //  console.log(user.tasks)

}
myFunction()

const upload= multer({
dest:'images',
limits:{
 fileSize: 1000000 //1MB
},
fileFilter(req,file,cb){
  if(!file.originalname.match(/\.(doc|docx)$/))
  {
 return  cb(new Error('Please upload document file'))
  }
  cb(undefined,true)

}
})
app.post('/upload',upload.single('upload'),(req,res)=>{
  res.send('File uploaded Suceessfuly')
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})
app.listen(port, () => {
  console.log("Server started with port", port);
});
