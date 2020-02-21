const express = require("express");
const Task = require("../models/Tasks");
const auth=require('../db/midlleware/auth')
const router = new express.Router();

router.post("/tasks", auth,async (req, res) => {
  try {
    
    const task=new Task({
        ...req.body,
        owner:req.user._id
    })
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET tasks?completed=true
// pagination limit=2&skip=2 i.e in skip 0 means 1st page,1 means 2nd page
// GET /tasks?sortBy=createdAt:desc i.e -1 for desc ,1 for asc
router.get("/tasks",auth, async (req, res) => {
  const match={}
  const sort={}

  try {
    //const tasks = await Task.find({owner:req.user._id});
    if(req.query.completed){
      match.completed=req.query.completed === 'true'
    }
    if(req.query.sortBy)
    {
      const parts=req.query.sortBy.split(':')
      sort[parts[0]]= parts[1] === 'desc'?-1:1
    }
    await req.user.populate({
      path:'tasks',
      match,
      options:{
        limit:parseInt(req.query.limit),
      skip:parseInt(req.query.skip),
      sort
      },
      
    }).execPopulate()
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/tasks/:id", auth,async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({_id,owner:req.user._id});
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/tasks/:id",auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  try {
    if (!isValidOperation)
      return res.status(404).send({ error: "Invalid field" });

    const task = await Task.findOne({_id:req.params.id,owner:req.user.id});
   
    updates.forEach(update => (task[update] = req.body[update]));
    task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/tasks/:id",auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete({_id:req.params.id,owner:req.user.id});
    if (!task) {
      return res.status(404).send({ error: "Invalid Id" });
    }
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
