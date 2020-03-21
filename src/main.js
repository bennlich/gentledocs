import config from '../config.js';
import { CoordinateSystem } from './CoordinateSystem.js';
import { migrate } from './migrations.js';
import { saveNewJargon } from './jargonModel.js';

let coordSystem = new CoordinateSystem();
coordSystem.registerEventListeners(document);
coordSystem.onChange(() => updateCoords());

let db = new PouchDB('jargon');

let baseFontSize = 14;

// Create the SVG container. This is what will contain the text.
let svgContainer = document.querySelector('#text-container');
svgContainer.style.width = `${window.innerWidth}px`;
svgContainer.style.height = `${window.innerHeight}px`;

let textGroup = html`<g class="jargon-group"></g>`;
svgContainer.appendChild(textGroup);

// A place to keep track of the currently in-use text input element
let currentEditInput = null;

// Transform textGroup coordinates for pan and zoom
function updateCoords() {
  let { x, y } = coordSystem.transform({ x: 0, y: 0 });
  textGroup.setAttribute('transform', `translate(${x},${y}) scale(${coordSystem.scale})`);
}

// This is the function that draws all the text. We're going to rerender the entire screen
// whenever a new piece of text gets added to the database.
async function render() {
  // Fetch all the docs (i.e. entries) in the database
  let docs = await db.allDocs({ include_docs: true });

  console.log(`Rendering ${docs.rows.length} jargon elements.`);

  // Delete all the existing text elements
  svgContainer.querySelectorAll('.jargon-el').forEach((el) => el.remove());

  // Create a new text element for each doc
  docs.rows.forEach((row) => {
    let { x, y, text } = row.doc;
    let fontSize = row.doc.fontSize;
    let textEl = html`
      <text class="jargon-el" y="${y}px" x="${x}px" font-size="${fontSize}px">${text}</text>
    `;
    textGroup.appendChild(textEl);
  });
}

// This function creates the text input element. We trigger it when you click on the page.
let onClick = (e) => {
  let initialValue = "";
  // If there's already a text input element
  if (currentEditInput) {
    // Save the text that's already typed in there
    initialValue = currentEditInput.value;
    // Remove the existing text input element
    currentEditInput.remove();
    // Delete the reference to the element that no longer exists
    currentEditInput = null;
  }

  // Create the new text input element
  let x = e.clientX;
  let y = e.clientY;
  let worldCoords = coordSystem.invert({ x, y });
  let newEditInput = currentEditInput = html`
    <input type="text" style="position: absolute; top: ${y}px; left: ${x}px;" value="${initialValue}"></input>
  `;

  // When the Enter key is pressed, submit the entry to the database, and remove the input element
  newEditInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveNewJargon(db, {
        text: newEditInput.value,
        fontSize: baseFontSize,
        x: worldCoords.x,
        y: worldCoords.y
      });
      newEditInput.remove();
      currentEditInput = null;
    }
  });

  // Add the element to the page
  document.body.appendChild(newEditInput);

  // Focus the element (i.e. get the cursor in there so you're ready to type)
  newEditInput.focus();
};

// Register the onClick function so it gets fired whenever someone clicks
window.addEventListener('pointerup', onClick);

// Rerender the screen whenever something gets added to the DB
db.changes({ since: 'now', live: true })
  .on('change', render);

// Synchronize the browser DB with the server DB (this way everyone sees the same words)
db.sync(config.remotePouchUrl, { live: true })
  .on('complete', () => console.log('Sync complete'))
  .on('error', (e) => console.log(e));

// Render everything the first time
render();

// Helper function for wiping the database clean
let clearDB = window.clearDB = async () => {
  let docs = await db.allDocs({include_docs: true});
  console.log(docs);
  docs.rows.forEach((row) => db.remove(row.doc));
};

let showDB = window.showDB = async () => {
  let docs = await db.allDocs({include_docs: true});
  console.log(docs.rows.map((r) => r.doc));
};

let migrateAllDocs = window.migrateAllDocs = async() => {
  let docs = await db.allDocs({include_docs: true});
  await Promise.all(docs.rows.map((row) => {
    let migratedDoc = migrate(row.doc);
    return db.put(migratedDoc);
  }));
  console.log("Done migrating docs.");
};
