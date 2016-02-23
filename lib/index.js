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
    , normalizePackData = require("normalize-package-data")
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
        input.hash = deffy(sha, input.hash);
    }

    let repo = null
    oneByOne([
        next => tmp.dir((err, path) => next(err, path))
      , (next, tmpPath) => {
            repo = new Gry(tmpPath);
            next();
        }
      , next => {
            repo.exec("clone", oArgv({
                _: [input.toString(), "."]
              , depth: input.hash ? undefined : "1"
            }), next)
        }
      , next => {
            if (!input.hash) { return next(); }
            repo.exec("checkout", oArgv({
                _: [input.hash]
            }), next)
        }
      , next => {
            readPackageJson(repo.cwd, next);
        }
    ], (err, data, pack) => {
        if (err && err.code === "ENOENT") {
            err = new Err("The package.json file is missing.", "PACKAGE_MISSING");
        }

        var warning = null;
        try {
            normalizePackData(pack)
        } catch (e) {
            warning = e;
        }

        callback(err, pack, warning);
    });
};
