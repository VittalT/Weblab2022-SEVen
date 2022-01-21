import { Schema, model, Document } from "mongoose";

const UserSchema = new Schema({
  name: String,
  googleid: String,
  current_game: String,
  rating: Number,
  all_time_rating: Number,
  games_played: Number,
  games_won: Number
});

export interface User extends Document {
  name: string;
  googleid: string;
  current_game: string;
  rating: number;
  all_time_rating: number;
  games_played: number;
  games_won: number;
  _id: string;
}

const UserModel = model<User>("User", UserSchema);

export default UserModel;
