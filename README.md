# journal - a blogging platform built on [\[matrix\]](https://matrix.org)

A web client for writing news stories, personal blogs and more, built on the Matrix protocol - https://matrix.org.

## Contents
 - [Introduction](#introduction)
 - [Development](#development)
  - [Quick Start](#quick-start)
  - [Deploying](#deploying)
  - [Contributing](#contributing)
 - [Screenshot](#screenshot)

## Introduction
journal is a website that can be used to display content stored on [Matrix](https://matrix.org) servers. Matrix is a distributed messaging protocol that allows messages to be sent to others across a network of homeservers across the globe. The distributed nature of Matrix makes it ideal for hosting published content, with no central server that could fail. journal is an attempt to use Matrix for viewing, creating and publishing journalistic writing and blogs.

### But what _is_ journal?
The [demo](http://journal.ldbco.de) shows one example of journal running in the wild. With this website users can read blogs that are already public on Matrix and interact with other subscribers and the authors using the comment functionality and create their own blogs. To access the Matrix network, users can login to the matrix.org homeserver with their Matrix user/password combination or login as a guest. Users can also specify their own homeserver to use as an entry point into the network. The login is necessary as part of the Matrix protocol to authenticate and identify users within the system.

It may also be argued that journal is an extension/adaptation of the Matrix protocol. It uses the flexibility of the Matrix protocol to embed published materials and comments with meta-data that serve to enhance the functionality of journal. There are other Matrix clients of course, but none that use the same meta-data as journal (yet).

### Use Cases
#### Personal Blog
journal can be used to create a personal blog website. The blog creator need only find a hosted instance of journal (like the one on [journal.ldbco.de](http://journal.ldbco.de)) to be able to publish material. Alternatively, if the creator is willing, they may want to run their own journal allowing personal touches like modification to the look-and-feel of the website.

#### Blog/News Site
journal can be used to create an entire website dedicated to viewing, creating and publishing journalistic writing and blogs! In truth, even if journal _is_ used as a personal blog site, users are still able to create their own blogs through the same interface. So really, even the personal blogs are entire blog websites.

## Development

### Quick Start

journal runs on [node.js](https://nodejs.org) version 6.2.2+

The code below builds an instance of journal in the [web](./web) directory.
```
git clone git@github.com:lukebarnard1/journal.git
cd journal
npm install

# build matrix-js-sdk
cd node_modules/matrix-js-sdk
npm run build
cd ..

# build journal
npm run build
```

To host an instance, the `dev` script can be used to run journal on port 4000 (port specified in [index.js](./index.js)).
```
npm run-script dev
```
This will build journal using [browserify](http://browserify.org/) and will watch for changes to the source in order to trigger builds when changes occur. [Express](http://expressjs.com/) is used to serve files in the [web](./web) directory at `http://localhost:4000`.

### Deploying
The `dev` script is enough to deploy, and requires node with Express installed. Otherwise, any other web server is perfectly fine -- when built, journal is simply a collection of files to be served over HTTP.

#### Style Modifications
Overriding CSS can be placed in the CSS style sheet located in [custom.css](./web/custom.css). To include it in the running version of journal, uncomment the relevant line in the `<head>` tag of [index.html](./web/index.html). Alternatively, the main style sheet [style.css](./web/style.css) can be edited.

### Contributing
journal needs some love!

#### Reporting Issues
If you find an issue through using journal, please report it on [Github](http://github.com/lukebarnard1/journal), making sure you follow the guidelines:
 - The title should summarise the issue entirely and succinctly: not too short and not too long.
 - For bugs, there must be a full set of steps (no matter how few/simple) required to reproduce it, and logs/stack traces are always appreciated.
 - For feature requests, the description should be as detailed as possible with, if possible, discussion of a possible implementation.

#### Submitting PRs
Please feel free to submit patches for any of the issues with journal. Follow these guidelines when you do submit patches:
 - Keep them focussed. This should help to speed up the code review process.
 - If a PR is in response to an existing issue, reference the issue number (e.g. #5).
 - If the issue being fixed is not reported yet, explain it in the PR and follow 2. of the [Reporting Issues](#reporting-issues) section.

## Screenshot

![alt-text](https://matrix.org/_matrix/media/v1/download/ldbco.de/wTcxfofwvDkOqcmjFMxQDxrA "Screenshot of journal")
