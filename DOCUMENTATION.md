## Documentation

You can see below the API reference of this module.

### `gitPackageJson(input, sha, callback)`
Gets the `package.json` file contents by passing the git url.

#### Params
- **String|GitSource** `input`: A [`GitSource`](https://github.com/IonicaBizau/git-source) object or the git url.
- **String** `sha`: An optional sha-ish (branch, version, commit sha etc) to set the project state.
- **Function** `callback`: The callback function.

