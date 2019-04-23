const QuestionRepository = require("../repositories/questionRepository");
const QR = new QuestionRepository();
const Authentication = require("../utils/authentication");
const JWT = new Authentication();

exports.add_question = async function(req, res) {
console.log(req.cookies);
console.log(req.headers.authorization);
  if (!req.headers.authorization && !req.cookies.access_token) {
    res.status(400).send({ status: "error", error: "No token provided" });
  } else {
    if (!req.headers.authorization) {
      var jwt = await JWT.validate(req.cookies.access_token);
    } else {
      var jwt = await JWT.validate(req.headers.authorization);
    }
    if (!jwt.username) {
      res.clearCookie("access_token");
      res.status(400).send({ status: "error", error: "Invalid JWT" });
    } else {
      const username = jwt.username;
      var result = await QR.create(
        username,
        req.body.title,
        req.body.body,
        req.body.tags,
        req.body.media
      );
	console.log(result);
      if (result.status == "error") {
        res.status(400).send({ status: result.status, error: result.data });
      } else {
        res.send({ status: result.status, id: result.data });
      }
    }
  }
};

exports.get_question_by_id = async function(req, res) {
  var ip = req.ip;
  if (!req.headers.authorization && !req.cookies.access_token) {
    // No JWT, use IP instead
    await QR.add_view_to_question(req.params.id, {
      type: "IP",
      query: ip
    });
  } else {
    if (!req.headers.authorization) {
      var jwt = await JWT.validate(req.cookies.access_token);
    } else {
      var jwt = await JWT.validate(req.headers.authorization);
    }
    if (!jwt.username) {
      // JWT is modified or expired, use IP instead
      //   res.clearCookie("access_token", { httpOnly: true });
      res.clearCookie("access_token");
      await QR.add_view_to_question(req.params.id, {
        type: "IP",
        query: ip
      });
    } else {
      // JWT is valid
      await QR.add_view_to_question(req.params.id, {
        type: "username",
        query: jwt.username
      });
    }
  }
  var result = await QR.get_questions_by_id(req.params.id);
  if (result.status == "error") {
    res.status(400).send({ status: result.status, error: result.data });
  } else {
    res.send({ status: "OK", question: result.data });
  }
};

exports.search_questions = async function(req, res) {
  var result = await QR.search_questions(
    req.body.timestamp,
    req.body.limit,
    req.body.accepted,
    req.body.q,
    req.body.sort_by,
    req.body.tags,
    req.body.has_media
  );
  if (result.status == "error") {
    res.status(400).send({ status: result.status, error: result.data });
  } else {
    res.send({ status: result.status, questions: result.data });
  }
};

exports.delete_question_by_id = async function(req, res) {
  if (!req.headers.authorization && !req.cookies.access_token) {
    res.status(400).send({ status: "error", error: "No token provided" });
  } else {
    if (!req.headers.authorization) {
      var token = await JWT.validate(req.cookies.access_token);
    } else {
      var token = await JWT.validate(req.headers.authorization);
    }
    if (!token.username) {
      res.status(400).send({ status: "error", error: "Invalid JWT" });
    } else {
      var result = await QR.delete_question(req.params.id, token.username);
      if (result.status == "OK") {
        res.status(200).send({ status: result.status, data: result.data });
      } else {
        res.status(400).send({ status: result.status, data: result.data });
      }
    }
  }
};

exports.get_user_questions = async (req, res) => {
  let result = await QR.get_questions_by_userID(req.params.id);
  res.send({ status: result.status, questions: result.data });
};

exports.upvote_question = async (req, res) => {
  if (!req.headers.authorization && !req.cookies.access_token) {
    res.status(400).send({ status: "error", error: "No token provided" });
  } else {
    if (!req.headers.authorization) {
      var token = await JWT.validate(req.cookies.access_token);
    } else {
      var token = await JWT.validate(req.headers.authorization);
    }
    if (!token.username) {
      res.status(400).send({ status: "error", error: "Invalid JWT" });
    } else {
      const result = await QR.upvote_question(
        req.params.id,
        req.body.upvote,
        token.username
      );
      res.send({ status: result.status });
    }
  }
};

// NOT AN API ENDPOINT, JUST FOR FRONTEND PRETTINESS
exports.get_question_upvote_status = async (req, res) => {
  if (!req.headers.authorization && !req.cookies.access_token) {
    res.status(400).send({ status: "error", error: "No token provided" });
  } else {
    if (!req.headers.authorization) {
      var token = await JWT.validate(req.cookies.access_token);
    } else {
      var token = await JWT.validate(req.headers.authorization);
    }
    if (!token.username) {
      res.status(400).send({ status: "error", error: "Invalid JWT" });
    } else {
      const result = await QR.get_question_upvote_status(
        req.params.id,
        token.username
      );
      res.send({ status: result.status, upvote: result.upvote });
    }
  }
};
