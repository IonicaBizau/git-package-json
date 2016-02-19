"use strict";

const Gry = require("gry")
    , tmp = require("tmp")
    , rJson = require("r-json")
    , Err = require("err")
    , gitSource = require("git-source")
    , oArgv = require("oargv")
    ;

/**
 * gitPackageJson
 * Gets the `package.json` file contents by passing the git url.
 *
 * @name gitPackageJson
 * @function
 * @param {String|GitSource} input A [`GitSource`](https://github.com/IonicaBizau/git-source) object or the git url.
 * @param {Function} callback The callback function.
 */
module.exports = function gitPackageJson (input, callback) {
    if (typeof input === "string") {
        input = gitSource(input);
    }
    tmp.dir((err, tmpPath) => {
        if (err) { return callback(err); }
        let repo = new Gry(tmpPath);
        repo.exec(oArgv({
            _: [input.toString(), "."]
          , depth: "1"
        }, "clone", true), err => {
            if (err) { return callback(err); }
            rJson(repo.cwd + "/package.json", (err, pack) => {
                if (err) {
                    if (err.code === "ENOENT") {
                        err = new Err("The package.json file is missing.", "PACKAGE_MISSING");
                    }
                    return callback(err);
                }
                callback(null, pack);
            });
        });
    });
};
