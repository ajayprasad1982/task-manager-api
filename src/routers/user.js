const express = require("express");
const User = require("../models/Users");
const auth = require("../db/midlleware/auth");
const multer=require('multer')
const sharp=require('sharp')
const {sendWelcomeEmail,sendCancellationEmail}=require('../emails/account')

const router = new express.Router();

const avatar=new multer({
  limits:{
    fileSize:1000000 //1MB 
  },
  fileFilter(req,file,cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
    {
      return cb(new Error('Please upload image file(jpg,jpeg,png)'))
    }
    cb(undefined,true)
  }

})

router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    sendWelcomeEmail(user.email,user.name)
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return req.token !== token.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/users/logoutAll',auth,async (req,res)=>{
  try{
     req.user.tokens=[]
     await req.user.save();
     res.send()
  }catch(e){
     res.status(500).send()
  }
})

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.get("/users/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/users/me", auth,async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["age", "name", "email", "password"];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    
    updates.every(update => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me", auth,async (req, res) => {
  try {
    await req.user.remove()
    sendCancellationEmail(req.user.email,req.user.name)
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.post('/users/me/avatar',auth,avatar.single('avatar'),async (req,res)=>{
  const buffer=await sharp(req.file.buffer).resize({height:250,width:250}).png().toBuffer()
  req.user.avatar=buffer
  await req.user.save()
res.send({msg:'File uploaded Sucessfully'})
},(error,req,res,next)=>{
  res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
  req.user.avatar=undefined
  await req.user.save()
res.send({msg:'File deleted Sucessfully'})
},(error,req,res,next)=>{
  res.status(400).send({error:error.message})
})

router.get('/users/:id/avatar',async (req,res)=>{
 try{ const user= await User.findById(req.params.id)
  if(!user || !user.avatar)
  throw Error('User or Image not found')
  res.set('Content-Type','image/png')
  res.send(user.avatar)

 }catch(error){
   res.status(404).send(error)
 }
})
module.exports = router;
