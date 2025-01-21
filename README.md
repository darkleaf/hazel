# Hazel

This proof of concept (POC) investigates how [Datomic](https://www.datomic.com/) principles can be adapted for the frontend environment.
It introduces a peer library, written in JavaScript, that is capable of navigating a [DataScript](https://github.com/tonsky/datascript/) database and storing its segments in the browser's cache.

This approach is useful for productivity tools like Asana, Jira, Slack, and Notion,
especially for applications that work with relatively large databases in the browser.
It is necessary to make fast queries on that data without access to the backend.

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

# How does it work?

You should first be familiar with the **DataScript** or **Datomic** data model. If not, please refer to the following resources:

- [Information Model](https://docs.datomic.com/datomic-overview.html#information-model)
- [Indexes](https://docs.datomic.com/datomic-overview.html#indexes)

## Datoms and Indexes

The **DataScript database** operates on **datoms**, which are atomic units of data. Each Datom is represented as a tuple `(E, A, V)`, where:

- `E` stands for the **entity ID**,
- `A` for the **attribute**, and
- `V` for the **value**.

These elements form the core structure of a Datom. To efficiently organize datoms, DataScript uses three indexes: **EAV**, **AEV**, and **AVE**. The name of each index reflects the order in which datoms are sorted:

- **EAV**: Sorted by entity ID, then attribute, then value.
- **AEV** and **AVE**: Follow analogous patterns.

While datoms in **Datomic** and **DataScript** also include an additional element `T` (Transaction ID), Hazel simplifies the model by excluding this component.

## Index Implementation and Optimization

The **indexes in DataScript** are implemented as **Persistent Sorted Sets**, a type of immutable data structure based on **B+ trees**. These structures are optimized for storing elements in sorted order and enable efficient operations such as lookups, insertions, and deletions, with a time complexity of $$O(\log n)$$. Functional immutability is achieved through **structural sharing**, ensuring that updates reuse existing data whenever possible. A detailed explanation of B-trees, including their variation B+ trees, can be found in the paper ["The Ubiquitous B-Tree"](https://carlosproal.com/ir/papers/p121-comer.pdf) by Douglas Comer.

Each node of the tree corresponds to a **storage segment**, serialized and stored persistently. **Branch nodes** contain keys and addresses for navigation, while **leaf nodes** store ordered sequences of keys (datoms). 

Since **persistent data structures** can lead to high overhead when updating the entire tree for every transaction, DataScript employs an optimization mechanism that relies on a tail for managing updates:

1. Committed datoms are temporarily stored in the "tail".
2. Once the size of the tail becomes comparable to a tree node, the tail is "flushed" into the tree.

This reduces the cost of updates significantly, maintaining efficient performance even under frequent modifications. For implementation details, see the [source code](https://github.com/tonsky/datascript/blob/fa222f7b1b05d4382414022ede011c88f3bad462/src/datascript/conn.cljc#L98).

***Hazel*** supports reading the indexes built by DataScript. Additionally, it ensures that data from the "tail" is accessible during queries, providing consistent and efficient data access in the browser.

## Transactions

DataScript database modifications rely on transactions, which are a central concept for updating indexes. While a comprehensive understanding of the entire transaction process is not required, it’s important to note that transactions are ultimately represented as a collections of **datoms**. Each Datom in transaction includes a flag that indicates whether it will be **added** to or **removed** from the database.

***Hazel*** operates on the frontend by interacting with the **storage segments** of a **[DataScript](https://github.com/tonsky/datascript/) database**, which are generated during transaction processing. It provides an API similar to Datomic's low-level API for interacting with data:

- `seek-datoms`
- `datoms`

## Asynchronous APIs

In both **Clojure(Script)** and **JavaScript**, these APIs expose data expose data using idiomatic tools for each ecosystem. In Clojure(Script), the methods return **lazy sequences**, enabling on-demand processing. In JavaScript, the equivalent of lazy sequences is a **Generator** (`function*/yield`). However, since nodes are requested asynchronously over the network, Hazel leverages asynchronous generators (**AsyncGenerator**) to manage this process.

For example:

```javascript
for async (const datom of db.eav.seek ....) {
  ...
}
```

This method is both asynchronous and lazy, fetching tree segments incrementally and enabling efficient iteration. By leveraging asynchronous operations, Hazel can handle large datasets efficiently and stop fetching data when no longer needed.

## Learning by Example

A motivated reader can easily grasp these concepts by reviewing the provided tests, which offer clear examples and practical insights. Additional details on persistent B+ trees and storage mechanisms in DataScript can be found in the following references:

- [Persistent Sorted Set Documentation](https://github.com/tonsky/persistent-sorted-set)
- [DataScript Storage](https://github.com/tonsky/datascript/blob/master/docs/storage.md)
- [Datomic Data Model](https://docs.datomic.com/whatis/data-model.html#datalog)

# Limitations

I've only implemented the methods (r)seek and datoms over indexes.

The main drawback I've found is access control.
For instance, consider an Asana project; it has tasks and collaborators, and each collaborator can read all tasks of the project.
I think we should store data per project database.
However, the problem is that we cannot just add an external collaborator to a task of this project
because our database is cached in the browser, and this collaborator will have access to all the data in the database.

I have two solutions for this problem:

+ Having an additional API for data access that runs queries on the backend, where we can easily handle access control, although we would lose caching.
+ Spreading (replicate) copies of a task across many databases (projects).

If you have any thoughts, feel free to open an issue in this repository.

# Future work

It is possible to implement [datalog](https://docs.datomic.com/query/query-executing.html)
and other Datomic/DataScript APIs.

It may be possible to adopt this approach for the local-first paradigm.
For example, we can implement Conflict-free Replicated Data Types (CRDT)
by writing database functions in JavaScript and optimistically transacting them on the frontend side.


# How to run

+ `docker build -t hazel . && docker run --rm -p 8080:8080 hazel`
+ open http://localhost:8080


# Dev

```
bun run test
```

Bun builder is currently in beta and lacks some features:

+ When using `build.js` for configuration, Bun reloads only the `build.js` file, not the other project files.
+ Automatic generation of manifest.json is not yet implemented.
