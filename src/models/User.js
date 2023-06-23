import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    avatarUrl: String,
    socialOnly: { type: Boolean, default: false },
    username: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String },
    location: String,
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});
// 생성되기 시작할때 해싱
userSchema.pre("save", async function () {
    if (this.isModified("password")) { // 비밀번호가 수정 될때만 해싱 (비디오 업로드때 user정보에 vidoes정보를 push하고 save()되는 과정에서 해싱 방지)
        this.password = await bcrypt.hash(this.password, 5);
    }
});

const User = mongoose.model("User", userSchema);
export default User;
