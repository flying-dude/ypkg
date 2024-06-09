#!/usr/bin/env node

import chalk from "chalk";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { init } from "./init.js";
import { add } from "./add.js";
import { fetch } from "./fetch.js";
import { sync, spawn } from "./sync.js";
import { update } from "./update.js";
import { get_project_folder } from "./project.js";

const fs = require("fs");
const path = require("path");

try {
  if (process.argv.length == 2) {
    await fetch();
    const project_folder = get_project_folder();
    if (fs.existsSync(path.join(project_folder, "CMakeLists.txt"))) {
      spawn("cmake", ["-S.", "-Bbuild", "-GNinja"], {
        stdio: "inherit",
        cwd: project_folder,
      });
      spawn("cmake", ["--build", "build"], {
        stdio: "inherit",
        cwd: project_folder,
      });
    }
  } else {
    await require("yargs")
      .scriptName("ypkg")
      .usage("$0 <cmd> [args]")
      .command(
        "init",
        "create a new cmake project",
        (yargs) => {},
        function (argv) {
          init();
        },
      )
      .command(
        "fetch [pkg...]",
        "download and extract packages",
        (yargs) => {},
        async function (argv) {
          await fetch(argv);
        },
      )
      .command(
        "sync",
        "synchronize package repo (git pull)",
        (yargs) => {},
        function (argv) {
          sync();
        },
      )
      .command(
        "update [pkg...]",
        "update project packages",
        (yargs) => {},
        function (argv) {
          update(argv);
        },
      ).argv;
  }
} catch (errors) {
  if (errors.constructor !== Array) errors = [errors];
  for (const error of errors) console.error(`[${chalk.red("error")}]`, error);
  process.exit(1);
}
