const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");
// Route 1 : Fetching all the Notes using : GET  "/api/notes/fetchallnotes" . login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  let success = false;
  try {
    const notes = await Notes.find({ user: req.user.id });
    success = true;
    res.json({success,msg:"Fetched all notes",notes});
  } catch (error) {
    success = false;
    res.status(500).send({success,msg:"Internal server error"});
  }
});

// Route 2 : Add a new Note  using : POST "/api/notes/fetchallnotes" . login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "title must be atleast 3 character").isLength({ min: 3 }),
    body("description", "description must be atleast 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
    try {
      const { title, description, tag } = req.body;
      // If there are errors , return bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({success, msg:"title must be atleast 3 character and description must be atleast 5 character"});
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      success = true;
      const savedNote = await note.save();
      res.json({success,msg:"Added Note Successfully",savedNote});
    } catch (error) {
      success = false;
      res.status(500).send({success,msg:"Internal server error"});
    }
  }
);

// Route 3 : Updating an existing note using : PUT "/api/notes/updatenote/:id" . login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  let success = false;
  try {
    const { title, description, tag } = req.body;
    //Create a newNote Object
    const newNote = {};
    if (title) { 
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //Find the note to be updated and update it
    const note = await Notes.findById(req.params.id);
    if (!note) {
      success = false;
      return res.status(404).send({success,msg:"Note not Found"});
    }

    //Allow updation only if user owns this note
    if (note.user.toString() !== req.user.id) {
      success = false;
      return res.status(401).send({success,msg:"Not Allowed"});
    }
    const updatedNote = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    success =true;
    res.json({success,msg:"Note Updated Successfully",updatedNote});
  } catch (error) {
    success = false;
      res.status(500).send({success,msg:"Internal server error"});
  }
});

// Route 4 : Deleting an existing note using : DELETE "/api/notes/deletenote/:id" . login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  let success =  false;
  try {
    //Find the note to be updated and delete it
    const note = await Notes.findById(req.params.id);
    if (!note) { 
      success = false;
      return res.status(404).send({success,msg:"Not Found"});
    }

    //Allow deletion only if user owns this note
    if (note.user.toString() !== req.user.id) {
      success = false;
      return res.status(401).send({success,msg:"Not Allowed"});
    }
    const updatedNote = await Notes.findByIdAndDelete(req.params.id);
    success = true;
    res.json({success, msg: "Note has been deleted", note: note });
  } catch (error) {
    success = false;
      res.status(500).send({success,msg:"Internal server error"});
  }
});

module.exports = router;
