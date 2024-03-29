const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () => {
      console.log("Server Running at http://localhost:4000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const query = `select * from cricket_team;`;
  const playersList = await db.all(query);

  const res = playersList.map((player) => ({
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  }));
  response.send(res);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const query = `
  insert into
   cricket_team (player_name,jersey_number,role)
   values
   (
       '${playerName}',
       ${jerseyNumber},
       '${role}'
    );`;

  await db.run(query);
  response.send("Player Added to Team");
});
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `select * from cricket_team where player_id=${playerId};`;
  const playerDetails = await db.get(query);
  let obj = {
    playerId: playerDetails.player_id,
    playerName: playerDetails.player_name,
    jerseyNumber: playerDetails.jersey_number,
    role: playerDetails.role,
  };
  response.send(obj);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const query = `
  update
   cricket_team 
  set 
  player_name='${playerName}',
  jersey_number=${jerseyNumber},
  role='${role}'
  where player_id=${playerId}
  ;`;

  await db.run(query);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `delete from cricket_team where player_id=${playerId};`;
  await db.run(query);
  response.send("Player Removed");
});

module.exports = app;
