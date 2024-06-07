import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("node:fs");
const path = require("node:path");

export function get_project_folder() {
  if (fs.existsSync("ypkg.toml")) {
    return process.cwd();
  }

  var folder = process.cwd();
  while (folder !== path.dirname(folder)) {
    folder = path.dirname(folder);
    if (fs.existsSync(path.join(folder, "ypkg.toml"))) {
      return folder;
    }
  }

  throw "not inside a ypkg folder";
}
