import { get_project_folder } from "./project.js";
import { get_packages } from "./sync.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("node:fs");
const path = require("node:path");
const semver = require("semver");

const toml = require("toml"); // this can only parse but not stringify
import * as toml2 from "@std/toml"; // this can stringify but crashes on parse

export function add(argv) {
  const pkgs = get_packages(argv.pkg);

  const project_folder = get_project_folder();
  const toml_file = path.join(project_folder, "ypkg.toml");
  const toml_data = toml.parse(fs.readFileSync(toml_file));

  for (const [pkg_name, pkg_data] of Object.entries(pkgs)) {
    var max_version = undefined;
    var max_version_data = undefined;
    for (const pkg_source of pkg_data.source) {
      if (!max_version || semver.gt(pkg_source.version, max_version)) {
        max_version = pkg_source.version;
        max_version_data = pkg_source;
      }
    }

    toml_data.packages = toml_data.packages ?? {};
    toml_data.packages[pkg_name] = max_version_data;
  }

  fs.writeFileSync(toml_file, toml2.stringify(toml_data).trimStart());
}
