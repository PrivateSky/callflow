# Using callflow in browsers

`simpleTest.js` is our test that we want to make it work in browser.

## Build with Browsify (https://github.com/browserify/browserify)

In order to be able to use callflow in browsers some "require()" calls are bundled in on single file that can be loaded usig `<script>` tag.

##Prerequisites

Make sure you already have installed globally `git` and node modules `browsify`, `http-server`.

`npm install -g browsify`
`npm install -g http-server`

## Resolving dynamic require() calls

All dependencies should be declared at the build time
```
var requiredDependencies = {
    "soundpubsub":{
        "id":"/modules/soundpubsub",
        "git_repo":"https://github.com/PrivateSky/soundpubsub.git"
    }
}
```

##Resolving module dependencies

The `runBrowserTest.js` script will resolve all dependencies and will export them in the `simpleTestBundle.js`. After that, the files will be removed from the system.

##Testing in browser

The `runBrowserTest.js` will open an http server that by default will use the port 9876. Make sure that this port is free or change it if is the case.
The `simpleTestFile.html` is the file that will contain the test. Open the console to check the results.


