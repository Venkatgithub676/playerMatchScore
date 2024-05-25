const express = require("express");
const app = express();
const sqlite = require("sqlite");
const { open } = sqlite;
const sqlite3 = require("sqlite3");
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error : ${error.message}`);
  }
};

initializeDBAndServer();

// get players api

app.get("/players/", async (request, response) => {
  let query = `select * from player_details;`;
  const res = await db.all(query);
  const res1 = res.map((each) => ({
    playerId: each.player_id,
    playerName: each.player_name,
  }));
  response.send(res1);
});

// get player api

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  let query = `select * from player_details where player_id=${playerId};`;
  const res = await db.get(query);
  const res1 = {
    playerId: res.player_id,
    playerName: res.player_name,
  };
  response.send(res1);
});

// update player api

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  let query = `update player_details set player_name='${playerName}' where player_id=${playerId};`;
  const res = await db.run(query);

  response.send("Player Details Updated");
});

// get match api

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  let query = `select * from match_details where match_id=${matchId};`;
  const res = await db.get(query);
  const res1 = {
    matchId: res.match_id,
    match: res.match,
    year: res.year,
  };
  response.send(res1);
});

// get player matches api

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const query = `select match_details.match_id as matchId,match,year from player_match_score inner join match_details on 
    match_details.match_id = player_match_score.match_id where player_match_score.player_id= ${playerId}; `;
  const res = await db.all(query);
  response.send(res);
});

// get match players api

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const query = `select player_details.player_id as playerId,player_details.player_name as playerName from 
  (match_details  inner join player_match_score on  match_details.match_id = player_match_score.match_id)  as T  
  inner join player_details on  T.player_id=player_details.player_id
  where T.match_id= ${matchId}; `;
  const res = await db.all(query);
  response.send(res);
});

// get stats api

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const query = `select player_details.player_id,player_details.player_name,sum(score),sum(fours),sum(sixes) from player_match_score inner join player_details
  on player_details.player_id=player_match_score.player_id where player_details.player_id=${playerId}`;
  const res = await db.get(query);
  const res1 = {
    playerId: res.player_id,
    playerName: res.player_name,
    totalScore: res["sum(score)"],
    totalFours: res["sum(fours)"],
    totalSixes: res["sum(sixes)"],
  };
  response.send(res1);
});

module.exports = app;
