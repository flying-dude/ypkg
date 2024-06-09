import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require("fs");

function create_file(file, content) {
  if (fs.existsSync(file)) throw "file already exists: " + file;
  fs.writeFileSync(file, content);
}

export function init() {
  create_file(
    "CMakeLists.txt",
    `cmake_minimum_required(VERSION 3.5)

project("app")

set(CMAKE_CXX_STANDARD 20)
add_definitions(-DVERSION="0.0.1")

file(GLOB_RECURSE SOURCES src/*.cpp)

add_executable(\${PROJECT_NAME} \${SOURCES})
`,
  );

  create_file("ypkg.toml", "");

  create_file("README.md", "a cmake project created with ypkg\n");

  create_file(
    ".gitignore",
    `build/
packages/
`,
  );

  create_file(
    ".clang-format",
    `# https://clang.llvm.org/docs/ClangFormatStyleOptions.html
---
Language: Cpp
BasedOnStyle: Google # https://google.github.io/styleguide/cppguide.html
ColumnLimit: 120

# "Fixed one-line if statement" https://reviews.llvm.org/D37140
AllowShortBlocksOnASingleLine: true
AllowShortCaseLabelsOnASingleLine: true
AllowShortEnumsOnASingleLine: true
AllowShortFunctionsOnASingleLine: true
AllowShortIfStatementsOnASingleLine: true
AllowShortLambdasOnASingleLine: true
AllowShortLoopsOnASingleLine: true
`,
  );

  if (!fs.existsSync("src")) fs.mkdirSync("src");

  create_file(
    "src/main.cpp",
    `#include <iostream>

int main() {
  std::cout << "successfully created a ypkg project!" << std::endl;
}
`,
  );
}
