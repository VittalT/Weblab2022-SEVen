const mongoose = require("mongoose");

const goldMineSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  val: Number,
});

const towerSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  user: String,
  health: Number,
});

const MapSchema = new mongoose.Schema({
  name: String,
  creator_id: String,
  num_players: Number, // 2, 3, or 4
  // borders: [(Number, Number)] // allow a path of line segments
  gold_mines: [goldMineSchema], // x, y, val
  towers: [towerSchema], // len(tower_locs) = num_players
  created: Date, // show in order of most recently created
});

module.exports = mongoose.model("map", MapSchema);
