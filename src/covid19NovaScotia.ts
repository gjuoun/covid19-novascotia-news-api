import axios from "axios";
import _ from "lodash";
import db from "./db";
import { updateCovidNews } from "./crawler";

export function getAll() {
  try {
    return db.get("covidNews").value();
  } catch (err) {
    console.log("error fetch all news from db");
  }
}

export async function sendLatestNewsToWebhooks() {
  const webhooks = db.get("webhooks").value();
  const requestPromises: Promise<string>[] = [];
  for (let webhook of webhooks) {
    requestPromises.push(
      new Promise(async (resolve, reject) => {
        try {
          const response = await axios.get(webhook.url, { timeout: 2000 });
          resolve("Webhook " + webhook.url + " is fired!");
        } catch (e) {
          resolve("Webhook " + webhook.url + " doesnt work");
        }
      })
    );
  }

  const results = await Promise.all(requestPromises);
  return results;
}

export async function updateNewsAndFireMsgToWebhooks() {
  const oldLength = db.get("covidNews").value().length;
  await updateCovidNews();
  const newLength = db.get("covidNews").value().length;
  if (newLength > oldLength) {
    console.log("Fetched covid news!");
    const webhookResult = await sendLatestNewsToWebhooks();
    console.log("Webhook results - ", webhookResult);
    return;
  } else {
    console.log("no updates needed");
  }
}

export function getLatestNews() {
  try {
    return db.get("covidNews").take(1).value()[0];
  } catch (err) {
    console.log("error fetch all news from db");
  }
}
