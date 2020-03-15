import { latestSchemaVersion } from './migrations.js';

async function saveNewJargon(db, { text, fontSize, x, y }) {
  let newJargon = {
    _id: new Date().toISOString(),
    schemaVersion: latestSchemaVersion,
    text: text,
    fontSize: fontSize,
    x: x,
    y: y
  };

  return db.put(newJargon);
}

export { saveNewJargon };
