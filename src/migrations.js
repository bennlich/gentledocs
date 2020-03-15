let migrations = [
  {
    description: 'Add a schema number to docs so we can keep track of what migrations to apply',
    migrateFn: (doc) => {
      doc.schemaVersion = 1;
      return doc;
    }
  }
];

window.latestSchemaVersion = migrations.length;

let migrate = (doc) => {
  if (!doc.schemaVersion) {
    // Apply all migrations to docs that have no schemaVersion
    console.log(`Migrations: applying ${migrations.length} migrations to doc.`);
    migrations.forEach(({ migrateFn }) => migrateFn(doc));
    return doc;
  } else {
    // Apply only the migrations the doc hasn't seen yet
    console.log(`Migrations: applying ${migrations.length - doc.schemaVersion} migrations to doc.`);
    migrations.slice(doc.schemaVersion).forEach(({ migrateFn }) => migrateFn(doc));
    return doc;
  }
};

export { migrate };
