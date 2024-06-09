Download C++ package sources and place them in your project folder.

Install
[`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
and then use
[`npx`](https://docs.npmjs.com/cli/v8/commands/npx)
to run:

```
$ npx ypkg --help
ypkg <cmd> [args]

Commands:
  ypkg init    create a new cmake project
  ypkg fetch   download and extract packages
  ypkg sync    synchronize package repo (git pull)
  ypkg update  update project packages

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## Initializing the Package Downloader

Simply place a package configuration file in your project root and you are ready to go.
An empty file will do:

```
$ touch ypkg.toml
```

Alternatively, initialize a cmake project using ypkg:

```
$ ypkg init

build/
src/
packages/

CMakeLists.txt
ypkg.toml
README.md

.clang-format
.gitignore
```

## Add a Package

The sources are downloaded and extracted into your project folder.
Otherwise this tool is non-invasive and you have to integrate the sources into your build workflow manually.

```
$ ypkg fetch tomlplusplus nlohmann-json

./packages/tomlplusplus/CMakeLists.txt
...

./packages/nlohmann-json/CMakeLists.txt
...
```

After the previous command, the following lines are inside `ypkg.toml`:

```toml
[packages.tomlplusplus]
version = "3.4.0"
url = "https://github.com/marzer/tomlplusplus/archive/refs/tags/v3.4.0.tar.gz"
sha512sum = "c227fc8147c9459b29ad24002aaf6ab2c42fac22ea04c1c52b283a0172581ccd4527b33c1931e0ef0d1db6b6a53f9e9882c6d4231c7f3494cf070d0220741aa5"

[packages.nlohmann-json]
version = "3.11.3"
url = "https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz"
sha512sum = "1aa94cdc3378a1fe0e3048ee73293e34bfa5ed9b46c6db0993e58e289ef818f7b7a472c0dc9c920114312e2e3ae1ff346ca797407ff48143744592adfd0a41ad"
```

## The Package Repository

The package info is placed in a repository
[`ypkg-repo`](https://github.com/flying-dude/ypkg-repo)
on github.
Currently there are few packages available but it will grow over time.

Fetch or update the package collection:

```
ypkg sync
```

## Updating Installed Packages

To keep your packages updated, simply do:

```
$ ypkg update tomlplusplus
$ ypkg update # update all packages
```

## Fetch and Build

Let's say you just cloned somebody else's git repository.
Now you can fetch required packages like so:

```
$ ypkg fetch
```

This will first read `ypkg.toml` file.
Next it will download and extract required packages into the project folder.

If you invoke `ypkg` without arguments, it will attempt to do a full build cycle for the project.
It will execute the following commands:

```
$ ypkg fetch
$ cmake -S . -B build -GNinja
$ cmake --build build
```
