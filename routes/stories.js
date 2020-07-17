const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const striptags = require("striptags");
const truncate = require("truncate");

const Story = require("../models/Story");

// @route   GET /stories/add
router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

// @route   POST /stories
router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// @route   GET /stories
router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();
    stories.forEach((story) => {
      story.body = striptags(story.body);
      story.body = truncate(story.body, 35);
    });
    res.render("stories/index", { stories });
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// @route   GET /stories/:id
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id })
      .populate("user")
      .lean();

    if (!story) {
      return res.render("error/404");
    } else {
      return res.render("stories/show", { story });
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// @route   GET /stories/edit/:id
router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id }).lean();

    if (!story) {
      res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      res.render("stories/edit", { story });
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// @route   PUT /stories/:id
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// @route   DELTE /stories/:id
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    await Story.remove({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// @route   GET /stories/user/:id
router.get("/user/:id", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.params.id, status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();
    stories.forEach((story) => {
      username = story.user.displayName;
      story.body = striptags(story.body);
      story.body = truncate(story.body, 35);
    });
    //console.log(res.locals.user.displayName);
    res.render("stories/index", {
      stories,
      username,
    });
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

module.exports = router;
