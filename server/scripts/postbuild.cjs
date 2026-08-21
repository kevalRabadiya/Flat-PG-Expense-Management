// Vercel deploys the contents of dist/ as the serverless function's root
// (/var/task), separate from server/package.json. Without a package.json
// declaring "type": "module" right next to dist/index.js, Node can't tell
// the compiled ESM output apart from CommonJS and refuses to load it
// ("Failed to load the ES module... set 'type': 'module' ... or use the
// .mjs extension"), causing every request to fail with
// FUNCTION_INVOCATION_FAILED. Writing a minimal package.json into dist/
// after every build guarantees that marker travels with the build output
// no matter how it gets packaged.
const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
fs.writeFileSync(
  path.join(distDir, "package.json"),
  JSON.stringify({ type: "module" }, null, 2) + "\n"
);
