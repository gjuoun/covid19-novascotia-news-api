"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const cheerio_1 = __importDefault(require("cheerio"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./db"));
/* ------------------ Nova Scotia Covid-19 news request url ----------------- */
const requestUrl = `https://novascotia.ca/news/search/?dept=180`;
/* ------------------------------------ - ----------------------------------- */
function getHtml(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // load certificate and send request
            const response = yield axios_1.default.get(url, {
                httpsAgent: new https_1.default.Agent({
                    ca: fs_1.default.readFileSync(path_1.default.join(__dirname, "../novascotia.ca/cert.pem")),
                    keepAlive: false,
                }),
            });
            return response.data;
        }
        catch (e) {
            console.log("error connecting ", url);
        }
    });
}
function getLatestNewsByHtml(html) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const $ = cheerio_1.default.load(html);
            const covidNews = db_1.default.get("covidNews").value();
            const dts = $("dt[class=RelTitle][lang=en]");
            dts.each((dtIndex, dtEl) => {
                const title = $(dtEl).text().trim();
                const id = $(dtEl).find("a").attr("href").match(/\d+$/)[0];
                const datetime = $(dtEl).next().find("time").attr("datetime").trim();
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
                const latestTimestamp = lodash_1.default.orderBy(covidNews, ["timestamp"], ["desc"])[0]
                    .timestamp;
                // if it's a newer news, push it to the first of array
                if (timestamp > latestTimestamp) {
                    covidNews.unshift(news);
                }
            });
            db_1.default.set("covidNews", covidNews).write();
            db_1.default.set("lastFetchAt", Date.now()).write();
        }
        catch (err) {
            console.log("Error with parse page html");
        }
    });
}
function updateCovidNews() {
    return __awaiter(this, void 0, void 0, function* () {
        const html = yield getHtml(requestUrl);
        yield getLatestNewsByHtml(html);
    });
}
exports.updateCovidNews = updateCovidNews;
//# sourceMappingURL=crawler.js.map