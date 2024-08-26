# Lezer Vitest Import Issue Reproduction

Minimal reproduction to demonstrate import errors when importing `*.grammar.terms` from vitest.

# Steps to reproduce error

* `yarn install`
* `yarn test`

# Notes

From what I can tell after some debugging `resolveId` in the rollup plugin is called correctly
when `vitest` attempts to resolve `import * as T from './basic.grammar.terms'`, and returns
a proper [virtual module](https://vitejs.dev/guide/api-plugin#virtual-modules-convention) as
described in the docs having a leading null byte (`\0`) to identify the virtual module.

However, for some reason `vitest` then passes the returned virtual module id back into the
module id resolution pipeline. When this happens `resolveId` is called again with a `source` argument
that looks something like `\0/Users/epfremmer/lezer-vitest-repro-1/basic.grammar.terms` which
then in turn resolves an invalid path in the form of `\0/Users/epfremmer/lezer-vitest-repro-1/\0/Users/epfremmer/lezer-vitest-repro-1/basic.grammar.terms`.

This second invalid module path is then passed into `load` as the id which results in an error
loading the invalid path. The error itself is a `TypeError` from `fs.readFile` because of the additional
null byte (`\0`) in the middle of the path, but the root cause is ultimately the path is invalid
due to the additional call to `resolveId`.

I found that adding an additional guard to `resolveId` fixes the issue:
```js
resolveId(source, importer) {
  if (source.startsWith('\0')) return null;
}
```

* _note: this only happens with `*.grammar.terms` and doesn't appear to be an issue with `*.grammar` imports_
* _note: this only appears to happen when something like `vitest` is running a dev server. Terms imports
are resolved correctly when bundling a project_
