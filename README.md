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

You should be familiar with the DataScript or Datomic data model.
If not, please read the following resources:

- [Information Model](https://docs.datomic.com/datomic-overview.html#information-model)
- [Indexes](https://docs.datomic.com/datomic-overview.html#indexes)

DataScript database работает с Datom, каждый Datom это тройка [идентификатор сущности, аттрибут, значение] (E, A, V).
Датомы хранятся в 3х покрывающих индексах: EAV, AEV, AVE. Где в имени отражен порядок сортивоки датомов в соответствующем индексе.
Отмечу, что datoms in Datomic and DataScript also include a Transaction ID or T, Hazel does not utilize this component.
Индекс реализован как sorted persistent set. Это B+ tree.

Изменение базы данных происходит с помощью транзакций.
Нам не нужно понимать весь процесс, а только то, что в конечном счете
транзакция это набор датомов с флагом, показывающим будет ли этот датом добавлен или удален.

Каждая нода дерева это storage segment. Именно он сериализуется и сохраняется в storage.
Т.к. используется персистентная структура данных, то каждая транзакция должна
приводить к перестройке дерева, но это накладно.
Вместо этого DataScript накапливает и хранит tail из изменений, пока он не станет сопоставим по размеру с нодой дерева,
и только потом применит эти изменения в дереву.

Hazel реализует обход сегментов и tail.
И предоставляет API, схожее с низкоуровневыми API Datomic:

+ seek-datoms
+ datoms

В Clojure/Script эти методы возвращают ленивую коллекцию.
В JavaScript аналогом lazy-seq является Generator (`function*/yield`).
Но, т.к. ноды запрашиваются асинхронно по сети, то тут испльзуются
Асихнонные Генераторы (AsyncGenerator).

Мотивированный читатель, с легкостью разберется в этих концепциях, прочитав тесты.









Hazel operates on the frontend of an application by interacting with the storage segments
of a [DataScript](https://github.com/tonsky/datascript/) database.
These segments are produced by the DataScript database during transaction processing.

The database is built on three covering indices: EAV, AEV, and VAE.
Although datoms in Datomic and DataScript also include a Transaction ID or T,
Hazel does not utilize this component.
Each index is structured as a persistent B+ tree, where each node of the tree is a storage segment of the database. The B+ tree used by Hazel consists of both branch and leaf nodes:

- **Branch nodes** contain an ordered sequence keys and addresses of other nodes, allowing navigation within the tree.
- **Leaf nodes** contain an ordered sequence of keys, where keys are an ordered sequence of datoms.


You can find the code and test of navigating of a tree here and here.
There







Additional details about DataScript storage can be found in
[the persistent sorted set documentation](https://github.com/tonsky/persistent-sorted-set#durability)





and [Datomic's data model documentation](https://docs.datomic.com/whatis/data-model.html#datalog).






https://docs.datomic.com/whatis/data-model.html#datalog

Each database consists of covering indices EAV, AEV, VAE.
Datomic and DataScript also add T - a transaction - but Hazel don't operate it.

Given that Hazel can read indices of a DataScript database in JavaScript.

The most low-level api of Datomic is `seek-datoms`.


In Hazel there is `db.eav.seek(1, "title", "Do smth")`.
And it is asyncronous and lazy.  Because it fetches segments over network and we should be able to stop fetching.
There is an abstraction for than in JavaScript - AsyncGenerator.
So `seek` and `datoms` methods of DB indeces are async generators.










DataScript uses a persistent B+ tree sorted set to store the database's indices.

Hazel fetches and caches nodes (segments) of DataScript's trees and lazily iterates over them.

For the lazy sequence abstraction, I chose AsyncGenerators.

+ https://github.com/tonsky/persistent-sorted-set
+ https://github.com/tonsky/datascript/blob/master/docs/storage.md
+ https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator
+ https://github.com/tonsky/persistent-sorted-set/pull/14



... (тут всякие детали реализации, типа b-tree, async generators, browser cache и прочее)



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
