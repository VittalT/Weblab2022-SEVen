import { Schema, model, Document } from "mongoose";

const UserSchema = new Schema({
  name: String,
  googleid: String,
  current_game: String,
});

export interface User extends Document {
  name: string;
  googleid: string;
  current_game: string;
  _id: string;
}

const UserModel = model<User>("User", UserSchema);

export default UserModel;
