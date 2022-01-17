import { Schema, model, Document, Types } from "mongoose";

const GameSchema = new Schema({
  isPrivate: { type: String },
  gameCode: { type: String },
  mapId: { type: String },
  created: { type: Date },
  creatorId: { type: String },
  playersIds: [{ type: String }],
});

export interface Game extends Document {
  isPrivate: string;
  gameCode: string;
  mapId: string;
  created: Date;
  creatorId: string;
  playersIds: Types.Array<string>;
  _id: string;
}

const GameModel = model<Game>("Game", GameSchema);

export default GameModel;
