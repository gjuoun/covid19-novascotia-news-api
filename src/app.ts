import express from "express";
import {
  getAll,
  getLatestNews,
  updateNewsAndFireMsgToWebhooks,
} from "./covid19NovaScotia";
import db from "./db";

const app = express();

app.get("/all", (req, res) => {
  res.send({
    success: true,
    data: getAll(),
  });
});

app.get("/latest", (req, res) => {
  res.send({
    success: true,
    data: getLatestNews(),
  });
});

app.get("/setWebhook", (req, res) => {
  if (!req.query.url) {
    return res.send({
      success: false,
      message: "Query param is missing: url",
    });
  }
  const url = <string>req.query.url;
  db.get("webhooks")
    .push({
      timestamp: Date.now(),
      url,
    })
    .write();

  res.send({
    success: true,
    message: "Webhook is set",
    url,
  });
});

const PORT = process.env.PORT || 6003;
app.listen(PORT, async () => {
  console.log("COVID19 NovaScotia News API is running at ", PORT);

  updateNewsAndFireMsgToWebhooks();

  // fetch every ten minutes
  const tenMins = 1000 * 60 * 10;
  setInterval(async () => {
    updateNewsAndFireMsgToWebhooks();
  }, tenMins);
});
