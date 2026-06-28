import Note from "../models/Note.js";

export async function getAllNotes(req, res) {
    try {
        const notes = await Note.find()
        return res.status(200).json(notes)
    } catch (error) {
        console.error("Error in getAllNotes controller", error)
        return res.status(500).json({message: "Internal server error"})
    }
};

export async function createNote(req, res) {
    try {
        const {title, content} = req.body
        const newNote = new Note({title: title, content: content})

        await newNote.save();
        return res.status(201).json({message: "Note created successfully"})
    } catch (error) {
        console.error("Error in createNote controller", error)
        return res.status(500).json({message: "Internal server error"})
    }
};

export async function updateNote(req, res) {
    res.status(201).json({message:"Note updated successfully"});
};

export async function deleteNote(req, res) {
    res.status(201).json({message:"Note deleted successfully"});
};
