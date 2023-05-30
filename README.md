
# Fava

File Access Via API

Exposes an HTTP and Websocket API to interact with the filesystem, and an optional web UI. Can be used either as a library or standalone application.

Components:

- **Core** - the main library, including webserver, adapters to all the types of storage
- **CLI** - run the library as a standalone application
- **Client** - client library to connect to the core HTTP API
- **UI** - web UI to manage files in configured storage locations

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
- and client constructor

# Development

Compile and watch the source, and start a hot-reloading web server for the UI:

`npm run dev`

Run tests:

`npm test`

> `--runInBand` is set to enable re-using the port number between serial tests

# TODO

Core

- server WS API
- server serve web page (different endpoints, API is default)
- define auth requirements
  - implement them
  - unauthenticated should *not* be the default
- ? file preview thumbnails?
- streams to manage large files, and moving between locations

client library

- have some kind of "current working directory"
- "up to parent directory" function
- API to support a file explorer
- doesn't need file display/preview capabilities
- doesn't need GUI components
- simple tree view in the UI

Future extensions:

- Create/generate OpenAPI spec for HTTP API
- thumbnail media previews
- preview selected file
- autoplay media/slideshow?

Out of scope (at least for the time being):



## Other adapter possibilities

- WebDAV? - https://www.npmjs.com/package/webdav
- S3
- B2 (S3?)
