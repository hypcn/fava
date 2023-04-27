
# Fava

Filesystem Access Via API

Exposes an HTTP and Websocket API to interact with the filesystem.

# Install

As a library within another application:

```
$ npm i @hypericon/fava
```

As a standalone application:

```
$ npm install @hypericon/fava --global
```

# Quickstart - Library

```typescript
const fava = new FavaServer({
  // 
});
```

# Quickstart - Standalone

```
$ fava --http --ws --ui --loglevel=log
```

# Quickstart - Client

TODO

# Options

TODO: detail the options of the server constructor

# TODO

Core

- ~~server HTTP API~~
- server WS API
- ~~server constructor with/without existing HTTP server~~
- server serve web page (different endpoints, API is default)
- ~~run server from cli~~
- define auth requirements
  - implement them
  - unauthenticated should *not* be the default

client library

- have some kind of "current working directory"
- "up to parent directory" function
- API to support a file explorer
- doesn't need file display/preview capabilities
- doesn't need GUI components
