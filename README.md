mode.js
===

Dead-simple web framework for [node](http://nodejs.org).

## Installation

mode.js is primarily built as a true MVC framework, but its simplicity allows you to use it straight out of the box as well.

### MVC project

Install mode globally:

    $ npm install -g mode

Create project folder and open it:

    $ mkdir foo && cd foo

Build MVC structure in current folder:

    $ mode init

Start app:

    $ mode start

Go to [localhost:1337](http://localhost:1337)*

\* Change port or other options in `conf/settings.js`

### Non-MVC project

Install mode locally:

    $ npm install mode

Open new .js file:

    $ vim foo.js

Require mode:

```js
var mode = require('mode');
```

Start mode, with a connection callback:

```js
mode.start({ server: { port: 1337 }}, function(conn, path)
{
    mode.server.close(conn, 'You are trying to open: ' + path);
});
```

Start app:

    $ node foo.js

Go to [localhost:1337](http://localhost:1337)