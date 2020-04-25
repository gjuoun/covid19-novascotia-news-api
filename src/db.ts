import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import path from 'path'
import { Database } from "types";

const adapter = new FileSync<Database>(path.join(__dirname, "../db.json"));
const db = low(adapter);

export default db