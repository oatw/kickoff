# Contributing to Kickoff

First off, thank you for considering contributing to Kickoff! :smiley:

Your kindly help will makes Kickoff a great tool keeps being improved.
Please take a few minutes to review this document to get you started.

## Communication Channels

Before starting your contributing journey,
please get familliar with Kickoff through [the offical site](https://oatw.github.io/kickoff).

## Using the Issue Tracker

The [issue tracker](https://github.com/oatw/kickoff/issues)
is the preferred channel for [bug reports](#bug-reports),
[features requests](#feature-requests) and [submitting pull requests](#pull-requests).

Please don't use the issue tracker for personal support requests,
the [communication channels](#communication-channels) are better ways to get help.

## Documentation

The documentation of Kickoff is written in Markdown, the Markdown files are in the
[`site/source/docs`](https://github.com/oatw/kickoff/tree/develop/site/source/docs)
directory of this repository.

## Bug Reports

Good bug reports are extremely helpful!
Please fill the issue template as detail as possible when you report bugs.
Thanks a lot!

:warning: __For security bugs, don't use the issue tracker!__
Please send your reports to [oatwoatw@gmail.com](mailto:oatwoatw@gmail.com) instead.

## Feature Requests

Your suggestion is important to Kickoff.
If you find yourself wishing for a feature that doesn't exist in Kickoff,
you are probably not alone.
Open an issue on the issues list
which describes the feature you would like to see, why you need it, and how it should work.

## Pull Requests

:thought_balloon: __Please describe your ideas before contributing your code to Kickoff__.
Are you going to add a new feature or fix a bug? How would you implement it?
You'd better start coding after getting a confirmation reply,
since unconfirmed pull requests may not be merged.

Kickoff follows the [Forking workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow).
You need fork this repository before embarking pull requests.
Only pull requests to the [`develop`](https://github.com/oatw/kickoff/tree/develop) branch will be merged.
So a new branch based on the `develop` branch is needed
when you're going to fix a bug or add a new feature.

## Development Setup

You will need install [Node.js](https://nodejs.org) version ~ 12,
[Yarn](https://yarnpkg.com) version 1.20+, [Ruby](https://www.ruby-lang.org) version ~> 2.6
and [Bundler](https://bundler.io/) version 2+.

Then, under the root of your local repo, run the below command to install
dependencies:

```bash
$ yarn install && bundle install
```

Finally, run the below command to start the dev server at port 4567:

```bash
$ thor serve:kickoff
```

## Source Files

[`src/sass`](https://github.com/oatw/kickoff/tree/develop/src/sass):
constains the sass source files,
the sass files will be compiled to theme css files before every release.

[`src/coffee`](https://github.com/oatw/kickoff/tree/develop/src/coffee):
constains the coffeescript source files,
the coffeescript files will be compiled to js files before every release.

## License

By contributing your code,
you agree to license your contribution under the
[MIT license](https://github.com/oatw/kickoff/blob/master/LICENSE).
