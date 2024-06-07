import { add } from "./add.js";
import { get_project_folder } from "./project.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("node:fs");
const path = require("node:path");
const toml = require("toml");

export function update(argv) {
  // if no packages are specified, we update all packages
  if (!argv.pkg) {
    argv.pkg = [];

    const project_folder = get_project_folder();
    const toml_file = path.join(project_folder, "ypkg.toml");
    const toml_data = toml.parse(fs.readFileSync(toml_file));

    for (const [pkg_name, _] of Object.entries(toml_data.packages)) {
      argv.pkg.push(pkg_name);
    }
  }

  add(argv);
}
