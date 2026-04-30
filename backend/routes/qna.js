const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');

// Post a question
router.post('/questions', async (req, res) => {
  const { content, userId } = req.body;
  try {
    const question = await Question.create({ content, postedBy: userId });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: 'Error posting question' });
  }
});

// Post an answer
router.post('/questions/:id/answers', async (req, res) => {
  const { content, userId } = req.body;
  const { id } = req.params;
  try {
    const answer = await Answer.create({ content, question: id, postedBy: userId });
    res.status(201).json(answer);
  } catch (error) {
    res.status(500).json({ error: 'Error posting answer' });
  }
});

// Get all questions with postedBy info
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find().populate('postedBy', 'name role').sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error("Error in /questions route:", error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get a single question with its answers
router.get('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('postedBy', 'name role');
    const answers = await Answer.find({ question: req.params.id }).populate('postedBy', 'name role');
    res.json({ question, answers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch question or answers' });
  }
});

module.exports = router;
