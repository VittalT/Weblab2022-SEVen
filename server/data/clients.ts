// maps each client to an object { room: gameCode }, clients not in rooms are removed

export const clients: Record<string, { gameCode: string }> = {};

module.exports = { clients };
