function generateGameCode(length: number): string {
  let str = "";
  for (let i = 0; i < length; i++) {
    str += Math.floor(Math.random() * 10).toString();
  }
  return str;
}

module.exports = { generateGameCode };
