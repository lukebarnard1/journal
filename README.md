# journal - a blogging platform built on [\[matrix\]](https://matrix.org)

Currently: An open source blog hosting website.

Future: A web client for writing news stories, personal blogs and more, built on the Matrix protocol - https://matrix.org.

## Contents
 - [Introduction](#introduction)
  - [Matrix](#matrix)
  - [But what is journal?](#but_what_is_journal)
 - [Development](#development)
  - [Quick Start](#quick_start)
  - [Manual Developing](#manual_developing)
  - [Contributing](#contributing)

## Introduction

journal is (currently) an open source blog website that in future will form part of a larger, decentralised blog network build on the Matrix protocol.

Originally, journal was a Matrix client that relied on being connected to a Matrix server in order to view blog posts, write blog posts and comment blog posts. However, connecting to a Matrix server to download blogs for the first time gave a poor user experience.

A change in architecture was devised to overcome this:

```
    journal backend-----[matrix]
      |  |                 |
      |  |         ________|
      |  |        |
      |  |        |
  ____|__:________|_next.js_
 |                          |
 | journal web UI frontend  |
 |__________________________|
       | :
       | |
       | |
   web browser
```

 1. The journal backend is pushed new blog data from the Matrix network, generating blog files.
 1. The journal web UI
   a. \*displays blogs
   a. allows for administration of the user's Matrix/journal account
   a. allows for creation of blogs and posting of comments via the Matrix network.

Items marked "\*" are completed.

### Matrix

Matrix is a distributed messaging protocol that allows messages to be sent to others across a network of homeservers across the globe. The distributed nature of Matrix makes it ideal for hosting published content, with no central server that could fail. journal is an attempt to use Matrix for viewing, creating and publishing journalistic writing and blogs.

In future, users will be able to read blogs and interact with other subscribers and the authors using the comment functionality or create their own blogs (if allowed my the journal admin).

Users will login to the matrix.org homeserver with their Matrix user/password combination or login as a guest. Users could also specify their own homeserver to use as an entry point into the network.

In this sense, journal will be seen as a use case of the Matrix protocol. It uses the flexibility of the Matrix protocol to embed published materials and comments with meta-data that serve to enhance the functionality of journal.

### But what _is_ journal?
The [demo](https://journal.lukebarnard.co.uk) shows one example of journal running in the wild. This currently demonstrates what viewing a blog could look like.

## Development

### Quick Start

journal runs on [node.js](https://nodejs.org) version >10

It is recommended to run journal in a docker container with the following commands (modifications encouraged).

```
mkdir articles
mkdir articles/baking

vi articles/baking/my-first-carrot-cake.md

export JOURNAL_ARTICLES_DIR=$(pwd)/articles

git clone git@github.com:lukebarnard1/journal.git
cd journal

docker build -t journal .
docker run -d \
  --name="journal" \
  --mount 'type=bind,source=$JOURNAL_ARTICLES_DIR,target=/usr/src/app/articles' \
  -p 3000:3000 \
  journal
```

# Manual/Developing

The code below will install dependencies for and run journal using `npm` and `node`.

```
git clone git@github.com:lukebarnard1/journal.git
cd journal

# Install dependencies
npm install

# Build and run journal
npm run build
npm run start
```

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

