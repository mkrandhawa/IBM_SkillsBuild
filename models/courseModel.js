const { MongoDBCollectionNamespace } = require("mongodb");
const mongoose = require("mongoose");

//Creating the schema for the courses
const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A course must have a name"],
      unique: true,
      trim: true,
      maxLength: [50, "The max length is 50 characters"],
      minLength: [10, "The min length is 10 characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A course must have a duration"],
    },

    difficulty: {
      type: String,
      required: [true, "A course must have difficulty level"],
      enum: {
        values: ["beginner", "intermediate", "expert"],
        message: "Difficulty must be beginner, intermediate or expert",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    imageCover: {
      type: String, //reference to the image
      required: [true, "A course must have a cover image"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: String,
      default: "Free",
    },
    summary: {
      type: String,
      required: [true, "A course must have a summary"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    coursePoints: {
      type: Number,
      default: 20,
    },
    //It will store the list of the users
    users: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User", //establishing refrences between user and tour do not need to require user
      },
    ],
  }, //end of schema
  //start of optionals
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseSchema.index({ slug: 1 });

//VIRTUAL POPUPLATE

courseSchema.virtual("reviews", {
  ref: "Review", //name of the model
  //forign field - name that is used to reperesent this model inside review model
  foreignField: "course",
  //local field - where the id is stored in the current course model
  localField: "_id",
});

/*
Runs before an actual event - DOCUMENT MIDDLEWARE
It will run before .save() and .create()
*/
courseSchema.post(/^find/, function (docs, next) {
  next();
});

//POPULATE Middleware
courseSchema.pre(/^find/, function (next) {
  this.populate({
    path: "users",
    select: "-__v", //these fields will be excluded
  });
  next();
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
