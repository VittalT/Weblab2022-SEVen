import { Schema, model, Document, Types } from "mongoose";

const goldMineSchema = new Schema({
  x: Number,
  y: Number,
  val: Number,
});

export interface goldMine extends Document{
  x: number;
  y: number;
  val: number;
  _id: string;
}

const towerSchema = new Schema({
  x: Number,
  y: Number,
});

export interface tower extends Document {
  x: number;
  y: number;
  _id: string;
}

const MapSchema = new Schema({
  name: String,
  creator_id: String,
  num_players: Number, // 2, 3, or 4
  // borders: [(Number, Number)] // allow a path of line segments
  gold_mines: [goldMineSchema], // x, y, val
  towers: [towerSchema], // len(tower_locs) = num_players
  created: Date, // show in order of most recently created
});

export interface Map extends Document {
  name: string;
  creator_id: string;
  num_players: number; // 2, 3, or 4
  gold_mines: Types.DocumentArray<goldMine>; // x, y, val
  towers: Types.DocumentArray<tower>; // len(tower_locs) = num_players
  created: Date; // show in order of most recently created
  _id: string;
}

const MapModel = model<Map>("Map", MapSchema);

export default MapModel;
