import mongoose from "mongoose";


const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  fileUrl: {type: String, required:true},
  description: { type: String, required: true, trim: true },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    
  },
  // User 객체의 _id : ObjectId 가 있는데 그거 가져온다 , ref: "User"에서
  owner:{type: mongoose.Schema.Types.ObjectId, required: true, ref:'User'}
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
