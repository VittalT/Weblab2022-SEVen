import { Schema, model, Document, Types } from "mongoose";

const GameSchema = new Schema({
  is_private: { type: String },
  game_code: { type: String },
  map_id: { type: String },
  created: { type: Date },
  creator_id: { type: String },
  players_ids: [{ type: String }],
});

export interface Game extends Document {
  is_private: string;
  game_code: string;
  map_id: string;
  created: Date;
  creator_id: string;
  players_ids: Types.Array<string>;
  _id: string;
}

const GameModel = model<Game>("Game", GameSchema);

export default GameModel;
