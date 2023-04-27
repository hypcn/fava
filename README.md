
# Fava

File Access Via API

Exposes an HTTP and Websocket API to interact with the filesystem, and an optional web UI. Can be used either as a library or standalone application.

# Install

## Library

As a library within another application:

```
$ npm i @hypericon/fava
```

## Standalone

As a standalone application:

```
$ npm install @hypericon/fava --global
```

# Quickstart

## Library

```typescript
const fava = new FavaServer({
  // 
});
```

## Standalone

```
$ fava --http --ws --ui --loglevel=log
```

## Client

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

Out of scope (at least for the time being):

- tree view in the UI
