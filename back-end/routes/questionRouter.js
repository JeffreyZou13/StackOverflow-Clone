const express = require("express");
const router = express.Router();

var QuestionController = require("../controllers/questionController");

router.post("/questions/add", QuestionController.add_question);
router.get("/questions/:id", QuestionController.get_question_by_id);
router.post("/search", QuestionController.search_questions);

module.exports = router;
