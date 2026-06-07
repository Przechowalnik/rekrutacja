import path from "node:path";
import { fileURLToPath } from "node:url";

import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sortKeys(object) {
  if (object && typeof object === "object") {
    if (Array.isArray(object)) {
      return object.map(element => sortKeys(element));
    }
    const sortedObject = {};
    for (const key of Object.keys(object).sort()) {
      sortedObject[key] = sortKeys(object[key]);
    }
    return sortedObject;
  }
  return object;
}

function processFiles(direction) {
  for (const file of fs.readdirSync(direction)) {
    const filePath = path.join(direction, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      processFiles(filePath);
    } else if (path.extname(file) === ".json") {
      console.warn(`Sorting ${filePath}`);
      const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const sortedJson = sortKeys(json);
      fs.writeFileSync(filePath, JSON.stringify(sortedJson, undefined, 2));
    }
  }
}

const folderPath = path.resolve(__dirname, "../app/locales");
processFiles(folderPath);
