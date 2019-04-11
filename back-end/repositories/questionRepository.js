const Mongoose = require("mongoose");
const QuestionModel = require("../models/questionModel");
const AnswerModel = require("../models/answerModel");
const UserModel = require("../models/userModel");
const ViewQuestionModel = require("../models/viewQuestionModel");
const UpvoteModel = require("../models/upvoteModel");
const uuidv4 = require("uuid/v4");

module.exports = class QuestionRepository {

  /**
   * Creates a question associated with a username
   * @param {String} username 
   * @param {String} title 
   * @param {String} body 
   * @param {Array} tags 
   */
  async create(username, title, body, tags) {
    // Check the fields
    if (!username) {
      return {
        status: "error",
        data: "Username is required"
      };
    }
    if (!title) {
      return {
        status: "error",
        data: "Title is required"
      };
    }
    if (!body) {
      return {
        status: "error",
        data: "Body is required"
      };
    }
    if (!tags) {
      return {
        status: "error",
        data: "Tags are required"
      };
    }
    const new_id = uuidv4();
    const new_question = new QuestionModel({
      id: new_id,
      username: username,
      title: title,
      body: body,
      tags: tags,
      timestamp: Date.now() / 1000
    });
    await new_question.save();
    return {
      status: "OK",
      data: new_id
    };
  }

  /**
   * Get a question associated with an id
   * @param {String} id 
   */
  async get_questions_by_id(id) {
    var found_question = await QuestionModel.findOne({
      id: id
    });
    if (!found_question) {
      return {
        status: "error",
        data: "Question does not exist"
      };
    }
    var question = await this.question_to_api_format(found_question);
    return {
      status: question.status,
      data: question.data
    };
  }

  /**
   * Add a view to a question by IP or username
   * @param {String} id 
   * @param {String} info 
   */
  async add_view_to_question(id, info) {
    var found_question = await QuestionModel.findOne({
      id: id
    });
    if (!found_question) {
      // Don't add a view if question does not exist
      return;
    }
    if (info.type == "IP") {
      // Don't increment if there is a view with this IP
      const find_view = await ViewQuestionModel.findOne({
        ip: info.query
      });
      if (find_view) {
        return;
      }
      const new_view = new ViewQuestionModel({
        question_id: id,
        ip: info.query
      });
      new_view.save();
    } else {
      // Don't increment if there is a view with this username
      const find_view = await ViewQuestionModel.findOne({
        username: info.query
      });
      if (find_view) {
        return;
      }
      const new_view = new ViewQuestionModel({
        question_id: id,
        username: info.query
      });
      new_view.save();
    }
  }

  /**
   * Searches for questions based on timestamp, limit, accepted (only questions with accepted answers)
   * @param {Integer} timestamp - Optional
   * @param {Integer} limit - Optional
   * @param {boolean} accepted - Optional
   * @param {String} q - Optional
   */
  async search_questions(timestamp, limit, accepted, q) {
    var search_timestamp = timestamp;
    if (!search_timestamp) {
      search_timestamp = new Date().getTime();
    }
    if (search_timestamp < 0) {
      return {
        status: "error",
        data: "Timestamp has to be a non-negative integer"
      };
    }
    // Search limit defaults to 25, and maxes out at 100
    var search_limit = limit;
    if (!search_limit) {
      search_limit = 25;
    }
    // const parsed_int = parseInt(search_limit, 10) //fix bug in front end
    // if (!Number.isInteger(parsed_int) || search_limit < 1) {
    //   return {
    //     status: "error",
    //     data: "Limit has to be a positive integer"
    //   };
    // }
    var parsed_int = search_limit;
    if (parsed_int < 1) parsed_int = 25;

    if (parsed_int > 100) {
      parsed_int = 100;
    }
    var search_accepted = accepted;
    if (!search_accepted) {
      search_accepted = false;
    }
    if (typeof search_accepted !== 'boolean') {
      return {
        status: "error",
        data: "Accepted has to be a boolean"
      };
    }
    var search_q = q;
    console.log(search_q);
    if (!search_q) {
      search_q = "";
    }
    if (typeof search_q !== 'string') {
      return {
        status: "error",
        data: "q has to be a string"
      };
    }
    var search_results;
    let query = { timestamp: { $lte: search_timestamp }};
    if(search_q)
      query.$text = { $search: search_q };
      console.log(query);
    if (search_accepted) {
      query.accepted_answer_id = { $ne: null };
      search_results = await QuestionModel.find(query,{ score: { $meta: "textScore" } })
      .limit(parsed_int)
      .sort({ score: { $meta:"textScore"} });
    } else {
      query.accepted_answer_id = null;
      search_results = await QuestionModel.find(query,{ score: { $meta: "textScore" } })
      .limit(parsed_int)
      .sort({ score: { $meta:"textScore" } });
    }
    var all_questions = [];
    for (var result in search_results) {
      var question_info = await this.question_to_api_format(
        search_results[result]
      );
      if (question_info.status == "error")
        return {
          status: "error",
          data: "Error fetching question data"
        };
      all_questions.push(question_info.data);
    }
    return {
      status: "OK",
      data: all_questions
    };
  }

  /**
   * Format a question into the one specified in the doc
   * @param {Object} format_question 
   */
  async question_to_api_format(format_question) {
    const user = await UserModel.findOne({
      username: format_question.username
    });
    if (!user) {
      return {
        status: "error",
        data: "User who created question does not exist"
      };
    }
    const view_count = await ViewQuestionModel.countDocuments({
      question_id: format_question.id
    });
    const answer_count = await AnswerModel.countDocuments({
      question_id: format_question.id
    });
    var question = {
      id: format_question.id,
      user: {
        id: user.id,
        username: user.username,
        reputation: user.reputation
      },
      title: format_question.title,
      body: format_question.body,
      score: 0, // TODO: IMPLEMENT THIS
      view_count: view_count,
      answer_count: answer_count,
      timestamp: format_question.timestamp,
      media: format_question.media,
      tags: format_question.tags,
      accepted_answer_id: format_question.accepted_answer_id
    };
    return {
      status: "OK",
      data: question
    };
  }

  /**
   * Deletes a question by id posted by user with username
   * @param {String} id 
   * @param {String} username 
   */
  async delete_question(id, username) {
    const found_question = await QuestionModel.findOne({ id: id });
    if (!found_question) {
      return { status: 'error', data: 'Question does not exist!'};
    }
    if (found_question.username != username) {
      return { status: 'error', data: 'User must be the original asker!'};
    }
    await QuestionModel.deleteOne({ id: id });
    return { status: 'OK', data: 'Success' };
  }

  /**
   * gets all question ids posted by user id (milestone 2)
   * @param {String} userID 
   */
  async get_questions_by_userID(userID) {
    let found_questions = await QuestionModel.find({username: userID})
    if(found_questions.length == 0) return {status: "error", data: "User has not posted questions yet!"}
    let all_questions = []
    for(let questions in found_questions) {
      let question_info = await this.question_to_api_format(found_questions[questions])
      if (question_info.status == "error") return {status: "error", data: "Error fetching question data"}
      else all_questions.push(question_info.data.id)
    }
    return {status: "OK", data: all_questions}
  }
  
  /**
   * Upvotes a question, or removes upvote, and updates reputation of asker
   * @param {String} questionID 
   * @param {Boolean} upvote 
   * @param {String} username 
   */
  async upvote_question(questionID, upvote, username) {
    const found_question = await QuestionModel.findOne({
      id: questionID
    })
    if (!found_question) {
      return { status: "error" };
    }
    // Convert the boolean from true/false to 1/-1 (default 1)
    upvote = typeof upvote === 'undefined' ? 1 : upvote ? 1 : -1;
    const found_upvote = await UpvoteModel.findOne({
      type: "question",
      username: username,
      question_id: questionID
    });
    // Upvoting after already upvoting undoes it
    if (found_upvote && found_upvote.value === upvote) {
      await UpvoteModel.deleteOne(found_upvote);
      return { status: "OK" };
    }
    // Upvoting after downvoting or vice versa, deletes previous upvote
    if (found_upvote) {
      await UpvoteModel.deleteOne(found_upvote); // Might not have to await
    }
    // Create and save upvote
    const new_upvote = new UpvoteModel({
      type: "question",
      username: username,
      question_id: questionID,
      value: upvote
    });
    await new_upvote.save();
    // Set reputation of asker only if the result is >= 1
    const user = await UserModel.findOne({
      username: found_question.username
    });
    const reputation = user.reputation;
    if (reputation + upvote >= 1) {
      await UserModel.updateOne({
        username: found_question.username
      }, {
        $set: { reputation: reputation + upvote }
      });
    }
    return { status: "OK" };
  }
};
