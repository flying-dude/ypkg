import { add } from "./add.js";
import { get_project_folder } from "./project.js";
import TOML from "smol-toml";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("node:fs");
const path = require("node:path");

export function update(argv) {
  // if no packages are specified, we update all packages
  if (!argv.pkg) {
    argv.pkg = [];

    const project_folder = get_project_folder();
    const toml_file = path.join(project_folder, "ypkg.toml");
    const toml_data = TOML.parse(
      fs.readFileSync(toml_file, { encoding: "utf8" }),
    );

    for (const [pkg_name, _] of Object.entries(toml_data.packages)) {
      argv.pkg.push(pkg_name);
    }
  }

  add(argv);
}
