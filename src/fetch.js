import { get_project_folder } from "./project.js";
import { spawn } from "./sync.js";
import TOML from 'smol-toml'

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const crypto = require("crypto");
const fs = require("node:fs");
const path = require("node:path");
const tmp = require("tmp");
const xdg = require("xdg-portable/cjs");
const Downloader = require("nodejs-file-downloader");

const downloads_folder = path.join(xdg.cache(), "ypkg", "downloads");

const get_hash = (path) =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha512");
    const stream = fs.createReadStream(path);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });

const recognized_extensions = [".tar.xz", ".tar.gz"];
export function get_extension(url) {
  for (const ext of recognized_extensions) if (url.endsWith(ext)) return ext;
  throw "unknown file extension for url: " + url;
}

// download and extract all packages specified in ypkg.toml
export async function fetch() {
  fs.mkdirSync(downloads_folder, { recursive: true });

  const project_folder = get_project_folder();
  const toml_file = path.join(project_folder, "ypkg.toml");
  const toml_data = TOML.parse(fs.readFileSync(toml_file, {encoding: "utf8"}));

  const package_folder = path.join(project_folder, "packages");
  if (!fs.existsSync(package_folder)) fs.mkdirSync(package_folder);

  // create temporary directory
  const tmp_dir = tmp.dirSync({ prefix: "ypkg" }).name;

  // download packages
  try {
    for (const [pkg_name, pkg_data] of Object.entries(toml_data.packages)) {
      const unpack_into = path.join(package_folder, pkg_name);
      if (fs.existsSync(unpack_into)) continue;

      const ext = get_extension(pkg_data.url);

      const destination_file = `${pkg_name}-${pkg_data.version}-${pkg_data.sha512sum.substring(0, 30)}${ext}`;
      const download_destination = path.join(
        downloads_folder,
        destination_file,
      );

      // download source archive, if not available
      if (!fs.existsSync(download_destination)) {
        const downloader = new Downloader({
          url: pkg_data.url,
          directory: tmp_dir,
          fileName: destination_file,
        });

        await downloader.download();

        const tmp_file = path.join(tmp_dir, destination_file);
        const hash = await get_hash(tmp_file);

        if (hash !== pkg_data.sha512sum)
          throw [
            `sha512 hash verification did not match for source file: ${destination_file}`,
            `found:    ${hash}`,
            `expected: ${pkg_data.sha512sum}`,
          ];

        // move verified file to cache folder
        fs.cpSync(tmp_file, download_destination);
      }

      // unpack source archive to project folder
      const tmp_unpack = path.join(tmp_dir, pkg_name)
      fs.mkdirSync(tmp_unpack)
      spawn("tar", ["xf", download_destination, "-C", tmp_unpack]);

      const files = fs.readdirSync(tmp_unpack)
      const from = files.length == 1 ? path.join(tmp_unpack, files[0]) : tmp_unpack

      fs.mkdirSync(unpack_into)
      fs.cpSync(from, unpack_into, {recursive: true})
    }
  } finally {
    // cleanup: remove temporary directory
    fs.rmSync(tmp_dir, { recursive: true, force: true });
  }
}
