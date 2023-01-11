import type { Team } from "~/models/team.server";

type GameResult = "win" | "loss" | "draw";

function getExpected(team1: Team, team2: Team, result: GameResult) {
  const chanceToWin = 1 / (1 + Math.pow(10, (team2.score - team1.score) / 400));

  const resultValue = {
    win: 1,
    loss: 0,
    draw: 0.5,
  }[result];

  return Math.round(32 * (resultValue - chanceToWin));
}

export function getMatchScore(team1: Team, team2: Team, result: GameResult) {
  return team1.score + getExpected(team1, team2, result);
}
