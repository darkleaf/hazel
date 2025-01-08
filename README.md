# Hazel

This proof of concept (POC) investigates how [Datomic](https://www.datomic.com/) principles can be adapted for the frontend environment.
It introduces a peer library, written in JavaScript, that is capable of navigating a [DataScript](https://github.com/tonsky/datascript/) database and storing its segments in the browser's cache.

The project is built upon the React TodoMVC framework.

The project's capabilities include:

- Lazy iteration over databases by fetching database segments on-demand from the backend.
- Long-term storage of these segments within the browser cache.
- Getting a consistent snapshot of a database.

For those unfamiliar with Datomic-like databases, here's an illustrative example of its core concept:

Consider a traditional database such as PostgreSQL or MySQL,
where data resides on the server's disk and your application's queries are processed on the server.
If you decide to cache a slow query's result within your application,
you essentially forego the query engine, reducing it to key-value (KV) storage.
In contrast, a Datomic-like system enables you to execute queries within your application utilizing its cache.

More info you can find in [Datomic Introduction](https://docs.datomic.com/datomic-overview.html).

# Techincal information

DataScript uses a persistent B+ tree sorted set to store the database's indices.

Hazel fetches and caches nodes (segments) of DataScript's trees and lazily iterates over them.
For the POC, Hazel only supports the methods (r)seek and datoms over indexes.

For the lazy sequence abstraction, I chose AsyncGenerators.

+ https://github.com/tonsky/persistent-sorted-set
+ https://github.com/tonsky/datascript/blob/master/docs/storage.md
+ https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator
+ https://github.com/tonsky/persistent-sorted-set/pull/14

# Run

+ Install [Bun](https://bun.sh/) >= v1.1.38
+ Install Clojure
+ `bun run build`
+ run `(hazel.core/start)`
+ open http://localhost:8080

# Thoughts

This approach is useful for productivity tools like Asana, Jira, Slack, and Notion,
especially for applications that work with relatively large databases in the browser.
It is necessary to make fast queries on that data without access to the backend.

It may be possible to adopt this approach for the local-first paradigm.
For example, we can implement Conflict-free Replicated Data Types (CRDT) by writing database functions in JavaScript and optimistically transacting them on the frontend side.

The main drawback I've found is access control.
For instance, consider an Asana project; it has tasks and collaborators, and each collaborator can read all tasks of the project.
I think we should store data per project database.
However, the problem is that we cannot just add an external collaborator to a task of this project
because our database is cached in the browser, and this collaborator will have access to all the data in the database.

I have two solutions for this problem:

+ Having an additional API for data access that runs queries on the backend, where we can easily handle access control, although we would lose caching.
+ Spreading (replicate) copies of a task across many databases (projects).

If you have any thoughts, feel free to open an issue in this repository.

# Dev

```
bun run test
```

Bun builder is currently in beta and lacks some features:

+ When using `build.js` for configuration, Bun reloads only the `build.js` file, not the other project files.
+ Automatic generation of manifest.json is not yet implemented.
