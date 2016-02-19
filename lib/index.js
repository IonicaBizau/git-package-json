"use strict";

const Gry = require("gry")
    , tmp = require("tmp")
    , rJson = require("r-json")
    , Err = require("err")
    , gitSource = require("git-source")
    , oArgv = require("oargv")
    , oneByOne = require("one-by-one")
    , deffy = require("deffy")
    , readPackageJson = require("r-package-json")
    ;

/**
 * gitPackageJson
 * Gets the `package.json` file contents by passing the git url.
 *
 * @name gitPackageJson
 * @function
 * @param {String|GitSource} input A [`GitSource`](https://github.com/IonicaBizau/git-source) object or the git url.
 * @param {String} sha An optional sha-ish (branch, version, commit sha etc) to set the project state.
 * @param {Function} callback The callback function.
 */
module.exports = function gitPackageJson (input, sha, callback) {

    if (typeof input === "string") {
        input = gitSource(input);
    }

    if (typeof sha  === "function") {
        callback = sha;
        sha = "";
    } else {
        input.hash = deffy(input.hash, sha || "");
    }


    tmp.dir((err, tmpPath) => {
        debugger
        if (err) { return callback(err); }
        let repo = new Gry(tmpPath);
        oneByOne([
            function (next) {
                repo.exec("clone", oArgv({
                    _: [input.toString(), "."]
                  , depth: "1"
                }), next)
            }
          , function (next) {
                if (!input.hash) { return next(); }
                repo.exec("checkout", oArgv({
                    _: [input.hash]
                  , depth: "1"
                }), next)
            }
          , function (next) {
                readPackageJson(repo.cwd, next);
            }
        ], function (err, data, pack) {
            if (err && err.code === "ENOENT") {
                err = new Err("The package.json file is missing.", "PACKAGE_MISSING");
            }
            callback(err, pack);
        });
    });
};
