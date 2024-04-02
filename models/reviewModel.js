const mongoose = require("mongoose");
const Course = require("./courseModel");

//Creating the schema for the reviews
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      minLength: 3,
      maxLength: 500,
      required: [true, "Review cannot be empty"],
    },
    rating: {
      type: Number,
      default: 0,
      required: [true, "A rating must be given if you want to post a review"],
      min: [1, "The rating must be 1 or above"],
      max: [5, "The rating cannot be above 5"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: "Course",
      required: [true, "Review must belong to a course"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  }, //end of schema
  //start of optionals
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//HANDLE DUPLICATE REVIEW
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

//POPULATE Middleware
//The pre word means that this will be done before the data is saved in DB
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  });

  next();
});

//CALCULATE AVERAGE RATING Middleware - Static methods
//calcAverageRatings is the name given to the function
reviewSchema.statics.calAverageRatings = async function (courseId) {
  const stats = await this.aggregate([
    {
      $match: { course: courseId },
    },
    {
      $group: {
        _id: "$course",
        nRating: { $sum: 1 },
        totalRating: { $sum: "$rating" }, // Sum of all ratings
      },
    },
  ]);

  if (stats.length > 0) {
    const nRating = stats[0].nRating;
    const totalRating = stats[0].totalRating;

    const average = totalRating / nRating;

    await Course.findByIdAndUpdate(courseId, {
      ratingsAverage: average,
      ratingsQuantity: nRating,
    });
  } else {
    // If there are no reviews, set ratingsAverage to 0 and ratingsQuantity to 0
    await Course.findByIdAndUpdate(courseId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.pre(
  "remove",
  { document: true, query: false },
  async function (next) {
    // Access the current review document
    const review = this;

    try {
      // Find the associated course and remove the review from its 'reviews' array
      await Course.findByIdAndUpdate(review.course, {
        $inc: { ratingsQuantity: -1 }, // Decrement ratingsQuantity by 1
      });

      // Recalculate the ratingsAverage of the course
      await Course.calAverageRatings(review.course);

      next();
    } catch (error) {
      next(error);
    }
  }
);

reviewSchema.post(["save", "remove"], function () {
  //this points to the current review constructor is the model that created that document
  this.constructor.calAverageRatings(this.course);
});

// Pre hook for findOneAndDelete and findOneAndUpdate
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.revi = await this.clone().findOne();
  next();
});

// Post hook for findOneAndDelete and findOneAndUpdate
reviewSchema.post(/^findOneAnd/, async function () {
  // If revi is set, call calAverageRatings
  if (this.revi) {
    await this.revi.constructor.calAverageRatings(this.revi.course);
  }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
