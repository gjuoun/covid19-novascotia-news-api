import axios from "axios";
import https from "https";
import cheerio from "cheerio";
import fs from "fs";
import _ from "lodash";
import path from "path";

import db from "./db";

/* ------------------ Nova Scotia Covid-19 news request url ----------------- */
const requestUrl = `https://novascotia.ca/news/search/?dept=180`;
/* ------------------------------------ - ----------------------------------- */

async function getHtml(url: string) {
  try {
    // load certificate and send request
    const response = await axios.get(url, {
      httpsAgent: new https.Agent({
        ca: fs.readFileSync(path.join(__dirname, "../novascotia.ca/cert.pem")),
        keepAlive: false,
      }),
    });

    return response.data;
  } catch (e) {
    console.log("error connecting ", url);
  }
}

async function getLatestNewsByHtml(html: string) {
  try {
    const $ = cheerio.load(html);
    const covidNews = db.get("covidNews").value();

    const dts = $("dt[class=RelTitle][lang=en]");
    dts.each((dtIndex, dtEl) => {
      const title = $(dtEl).text().trim();
      const id = $(dtEl).find("a").attr("href")!.match(/\d+$/)![0];
      const datetime = $(dtEl).next().find("time").attr("datetime")!.trim();

      // convert 2020-04-25T13:56:00-03:00 to timestamp
      const timestamp = new Date(datetime).getTime() / 1000;
      const summary = $(dtEl).next().find("p").text().trim();

      const news = {
        id,
        title,
        timestamp,
        summary,
      };

      if (!covidNews[0]) {
        covidNews.push(news);
        return true;
      }

      // sort is ascending by default
      const latestTimestamp = _.orderBy(covidNews, ["timestamp"], ["desc"])[0]
        .timestamp;

      // if it's a newer news, push it to the first of array
      if (timestamp > latestTimestamp) {
        covidNews.unshift(news);
      }
    });

    db.set("covidNews", covidNews).write();
    db.set("lastFetchAt", Date.now()).write();
  } catch (err) {
    console.log("Error with parse page html");
  }
}

export async function updateCovidNews() {
  const html = await getHtml(requestUrl);
  await getLatestNewsByHtml(html);
}
