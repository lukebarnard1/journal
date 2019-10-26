# journal - a blogging platform built on [\[matrix\]](https://matrix.org)

An open source blog hosting website.

### Note: journal is no longer maintained

What I imagined it could be: A web client for writing news stories, personal blogs and more, built on the Matrix protocol - https://matrix.org.

What happened: I didn't have enough time to build the entire thing, plus there are decent alternatives. See https://github.com/lukebarnard1/journal/issues/118.

## Contents
 - [Introduction](#introduction)
   - [Matrix](#matrix)
   - [But what is journal?](#but_what_is_journal)
 - [Installation](#installation)
 - [Contributing](#contributing)

## Introduction

journal is (currently) an open source blog website that in future will be part of a larger system, forming part of a decentralised blog network built on the Matrix protocol.

Originally, journal was a Matrix client that relied on being connected to a Matrix server in order to view blog posts, write blog posts and comment on blog posts. However, connecting to a Matrix server to download blogs for the first time gave a poor user experience so a change in architecture was devised to overcome this:

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
   - \*displays blogs
   - via the Matrix network protocol
       - allows for administration of the user's Matrix/journal account
       - allows for creation of blogs and posting of comments.
       - allows for blog subscription and notifications

Items marked "\*" are completed.

### Matrix

Matrix is a messaging protocol that distributes chat rooms across a global network of "home servers". The distributed nature of Matrix makes it ideal for hosting published content, with no central server that could fail and the potential for real-time interaction from Matrix users with effectively "free" support for chat rooms. journal is an attempt to use Matrix for viewing, creating and publishing journalistic writing and blogs.

In future, users could be able to subscribe to blogs, hold discussions on a blog or create their own blogs (if allowed by the journal admin).

Users will login to the matrix.org homeserver with their Matrix user/password combination or login as a guest. Users could also specify their own homeserver to use as an entry point into the network.

In this sense, journal will be seen as a use case of the Matrix protocol. It uses the flexibility of the Matrix protocol to embed published materials and comments with meta-data that serve to enhance the functionality of journal.

### Next.js

Next.js is now a key component to the journal web view. It enables SSR (Server-Side Rendering) of pages that are rendered using React. This makes viewing pages snappy but keeps the benefits of being able to update the view dynamically based on user interaction and new data from the server.

### But what _is_ journal?
The [demo](https://journal.lukebarnard.co.uk) shows one example of journal running in the wild. This currently demonstrates what viewing a blog looks like.

## Installation

### Docker

journal runs on [node.js](https://nodejs.org) version >=8

It is recommended to run journal in a docker container with the following commands:

```
# Create a directory for all of your markdown articles
mkdir articles

# Create a category directory
mkdir articles/baking

# Create your first article (See docs/writing-an-article.md)
vi articles/baking/my-first-carrot-cake.md

export JOURNAL_ARTICLES_DIR=$(pwd)/articles

git clone git@github.com:lukebarnard1/journal.git
cd journal

docker build -t journal .
docker run -d \
  --name="journal" \
  --mount "type=bind,source=$JOURNAL_ARTICLES_DIR,target=/usr/src/app/web/articles" \
  -p 3000:3000 \
  journal

# journal should now be visible at http://localhost:3000

```

### Developing Locally

The code below will install dependencies for and run journal using `npm` and `node`, with hot reloading when code changes are made.

```
git clone git@github.com:lukebarnard1/journal.git
cd journal

# Install dependencies
npm install

# Build and run journal
npm run build
npm run start

# journal should now be visible at http://localhost:3000
```

## Contributing
journal needs some love!

### Reporting Issues
If you find an issue through using journal, please report it on [Github](http://github.com/lukebarnard1/journal), making sure you follow the guidelines:
 - The title should summarise the issue entirely and succinctly: not too short and not too long.
 - For bugs, there must be a full set of steps (no matter how few/simple) required to reproduce it, and logs/stack traces are always appreciated.
 - For feature requests, the description should be as detailed as possible with, if possible, discussion of a possible implementation.

### Submitting PRs
Please feel free to submit patches for any of the issues with journal. Follow these guidelines when you do submit patches:
 - Keep them focussed. This should help to speed up the code review process.
 - If a PR is in response to an existing issue, reference the issue number (e.g. #5).
 - If the issue being fixed is not reported yet, explain it in the PR and follow 2. of the [Reporting Issues](#reporting-issues) section.

