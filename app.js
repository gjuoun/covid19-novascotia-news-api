const axios = require("axios");
const https = require("https");
const cheerio = require("cheerio");
const fs = require("fs");

// const requestUrl = `https://novascotia.ca/coronavirus/data/COVID-19-data.csv`;

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)

async function getHtml(url) {
  try {
    const response = await axios.get(url, {
      httpsAgent: new https.Agent({
        ca: fs.readFileSync("./novascotia.ca/cert.pem"),
        keepAlive: false,
      }),
    });

    return response.data;
  } catch (e) {
    console.log("error connecting ", requestUrl);
  }
}

async function getLatestNews(html) {
  const $ = cheerio.load(html);

  const dts = $("dt[class=RelTitle][lang=en]");
  dts.each((dtIndex, dtEl) => {
    const title = $(dtEl).text().trim();
    const id = $(dtEl).find("a").attr("href").match(/\d+$/)[0];
    const datetime = $(dtEl).next().find("time").attr("datetime").trim();

    const timestamp = 500 + new Date(datetime).getTime() / 1000;
    const summary = $(dtEl).next().find("p").text().trim();

    const latestTimestamp = db
      .get("news")
      .sortBy("timestamp")
      .reverse()
      .take(1)
      .value()[0].timestamp;

    // if it's a newer news, push it
    if (timestamp > latestTimestamp) {
      db.get("news").push({ id, title, timestamp, summary }).write();
    }
  });

  return db.get("news").sortBy("timestamp").reverse().take(1).value();
}

async function main() {
  const requestUrl = `https://novascotia.ca/news/search/?dept=180`;

  const html = await getHtml(requestUrl);
  const news = await getLatestNews(html);

  // console.log(news);
}

/* ------------------------------ Start Program ----------------------------- */
main();
