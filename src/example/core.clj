(ns example.core
  (:require
   [me.tonsky.persistent-sorted-set :as set]
   [ring.adapter.jetty :as jetty]
   [jsonista.core :as json]
   [clojure.string :as str])
  (:import
   (me.tonsky.persistent_sorted_set IStorage Branch Leaf Settings)))

(set! *warn-on-reflection* true)

(defrecord Storage [*storage ^Settings settings]
  IStorage
  (store [_ node]
    (let [;; node    ^ANode node
          address (str (random-uuid))]
      (swap! *storage assoc address
             (json/write-value-as-string
              {:type (if (instance? Branch node) ;; for js
                       :branch
                       :leaf)
               :level     (.level node)
               :keys      (.keys node)
               :addresses (when (instance? Branch node)
                            (.addresses ^Branch node))}))
      address))

  (restore [_ address]
    (let [blob (get @*storage address)

          {:strs [level
                  ^java.util.List keys
                  ^java.util.List addresses]}
          (json/read-value blob)]

      (if addresses
        (Branch. (int level) ^java.util.List keys ^java.util.List addresses settings)
        (Leaf. keys settings)))))

(defn storage ^IStorage [*storage]
  (->Storage *storage (Settings.)))



(def *storage (atom {}))



(let [storage (storage *storage)
      set     (apply set/sorted-set (range 1000))]
  (set/store set storage))
;; => "9fa3baff-0ba8-402f-9fdf-35b014331f03"


(let [storage (storage *storage)
      set (set/restore "9fa3baff-0ba8-402f-9fdf-35b014331f03" storage)
      set (conj set 1005)]
  (set/store set storage))
;; => "8aa15f17-2369-45a2-af4c-1fd0a727f7c2"


(defn- uri->address [s]
  (subs s 1 (count s)))


(defn handler [req]

  (prn :req)

  (let [address (uri->address (:uri req))
        node    (@*storage address)]
    (if (some? node)
      {:status 200
       :body   node
       :headers {"Content-type" "application/json"
                 "Access-Control-Allow-Origin" "*"
                 "Cache-control" "public, max-age=604800, immutable"}}
      {:status 404})))


(def server (jetty/run-jetty #'handler
                             {:join? false
                              :port 8080}))

(.stop server)


pull(:ave, start: ["user/name", "Anya"] , ["task/title" ,...])

[
 #_eav
 entity
 attribute
 value
 [e a v]
 [1 "task/title" "Сделать работу"]
 [1 "task/assignee" 42]
 [2 "task/title" "Сделать работу2"]
 #_[42 "user/name" "Vasya"]
 [42 "user/name" "Vasya"]]

"task/segment"
[
 #_aev
 [1 "task/assignee" 42]
 [1 "task/title" "Сделать работу"]
 [2 "task/title" "Сделать работу2"]
 [42 "user/name" "Vasya"]]

[
 #_ave

 ???
 [1 "task/assignee" 42]
 [1 "task/title" "Сделать работу"]
 [2 "task/title" "Сделать работу2"]
 [42 "user/name" "Vasya"]]
