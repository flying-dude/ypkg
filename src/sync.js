import TOML from 'smol-toml'

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const xdg = require("xdg-portable/cjs");
const fs = require("node:fs");
const path = require("node:path");
const child_process = require("child_process");

const git_dir = path.join(xdg.cache(), "ypkg", "ypkg-repo");
const allowed_signers_file = path.join(xdg.cache(), "ypkg", "allowed_signers");

// make sure the current git commit was correctly signed by someone
export function verify() {
  const { status } = child_process.spawnSync(
    "git",
    ["-C", git_dir, "verify-commit", "HEAD"],
    {
      stdio: "ignore",
    },
  );
  if (status !== 0) throw "could not verify package repo signature";
}

export function spawn(cmd, args, options) {
  options = options ?? { stdio: "inherit" };
  const { status } = child_process.spawnSync(cmd, args, options);
  if (status !== 0) throw `command failed: ${cmd} ${args.join(" ")}`;
}

// this will clone the package repo, if that hasn't been done yet
export function init_sync() {
  if (fs.existsSync(git_dir)) return;

  const repo_url = "https://github.com/flying-dude/ypkg-repo";
  spawn("git", ["clone", "--depth", "1", "--", repo_url, git_dir]);

  fs.writeFileSync(
    allowed_signers_file,
    `dude@flyspace.dev ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE9qJsZ35FLI61AYNgb9y+3ZgOBJpr9ebFv8jgkDymPT
`,
  );

  spawn("git", [
    "-C",
    git_dir,
    "config",
    "gpg.ssh.allowedSignersFile",
    allowed_signers_file,
  ]);

  verify();
}

// obtain a list of packages by name
export function get_packages(pkgs) {
  init_sync();
  verify();

  const found = {};
  const not_found = [];

  for (const pkg of pkgs) {
    const toml_file = path.join(git_dir, "pkg", pkg + ".toml");
    if (fs.existsSync(toml_file))
      found[pkg] = TOML.parse(fs.readFileSync(toml_file, {encoding: "utf8"}));
    else not_found.push(pkg);
  }

  if (not_found.length > 0) throw "package(s) not found: " + not_found;

  return found;
}

// update package colletion using "git pull"
export function sync() {
  init_sync();

  // https://stackoverflow.com/questions/41075972/how-to-update-a-git-shallow-clone
  spawn("git", ["-C", git_dir, "fetch", "--depth", "1"]);
  spawn("git", ["-C", git_dir, "reset", "--hard", "origin/main"]);

  verify();
}
