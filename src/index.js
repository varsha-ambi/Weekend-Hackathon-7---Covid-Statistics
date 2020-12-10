const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 8080;

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require("./connector");

app.get("/totalRecovered", async (req, res) => {
  const totalRecovered = await collection_connection.aggregate([
    {
      $group: {
        _id: "total",
        recovered: {
          $sum: "$recovered"
        }
      }
    }
  ]);
  let x = totalRecovered[0];
  let y = { ...x };
  let result = { data: y };
  res.send(result);
});

app.get("/totalActive", async (req, res) => {
  const recovered = await collection_connection.aggregate([
    {
      $group: {
        _id: "total",
        recovered: {
          $sum: "$recovered"
        }
      }
    }
  ]);
  //console.log(recovered);
  const recover = recovered[0].recovered;

  const infected = await collection_connection.aggregate([
    {
      $group: {
        _id: "total",
        infected: {
          $sum: "$infected"
        }
      }
    }
  ]);
  const infect = infected[0].infected;

  const active = infect - recover;

  const result = { data: { _id: "total", active: active } };

  res.send(result);
});

app.get("/totalDeath", async (req, res) => {
  const deathToll = await collection_connection.aggregate([
    {
      $group: {
        _id: "total",
        death: {
          $sum: "$death"
        }
      }
    }
  ]);

  const x = deathToll[0];
  const result = { data: x };
  console.log(result);

  res.send(result);
});

app.get("/hotspotStates", async (req, res) => {
  const data = await collection_connection.aggregate([
    {
      $project: {
        _id: 0,
        state: 1,
        rate: {
          $round: [
            {
              $divide: [{ $subtract: ["$infected", "$recovered"] }, "$infected"]
            },
            5
          ]
        }
      }
    }
  ]);

  const newData = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i].rate > 0.1) {
      newData.push(data[i]);
    }
  }

  //console.log(NewData);
  const result = { data: newData };
  res.send(result);
});

app.get("/healthyStates", async (req, res) => {
  const data = await collection_connection.aggregate([
    {
      $project: {
        _id: 0,
        state: 1,
        mortality: {
          $round: [{ $divide: ["$death", "$infected"] }, 5]
        }
      }
    }
  ]);

  const newData = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i].mortality < 0.005) {
      newData.push(data[i]);
    }
  }
  const result = { data: newData };

  res.send(result);
});

app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;
