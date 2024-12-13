(ns hazel.core
  (:require
   [me.tonsky.persistent-sorted-set :as set]
   [ring.adapter.jetty :as jetty]
   [jsonista.core :as json]
   [clojure.string :as str]
   [darkleaf.di.core :as di]

   [reitit.ring])
  (:import
   #_(clojure.lang IDeref)
   (org.eclipse.jetty.server Server)
   (me.tonsky.persistent_sorted_set IStorage Branch Leaf Settings)))

(set! *warn-on-reflection* true)


(def route-data
  (di/template
   ["/*" (di/ref `resources)]))

(defn storage
  {::di/kind :component}
  []
  (let [*storage (atom {})
        settings (Settings.)]
    (reify IStorage
      (store [_ node]
        (let [address (str (random-uuid))]
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
            (Leaf. keys settings)))))))


#_
(defn handler [_ req]

  (prn :req)

  {:status 200
   :body "ok"}

  #_
  (let [address (uri->address (:uri req))
        node    (@*storage address)]
    (if (some? node)
      {:status 200
       :body   node
       :headers {"Content-type" "application/json"
                 "Access-Control-Allow-Origin" "*"
                 "Cache-control" "public, max-age=604800, immutable"}}
      {:status 404})))




(comment

  (def system (di/start `jetty))
  (di/stop system)


  (require '[clojure.repl.deps :as repl.deps])
  (repl.deps/sync-deps)

  ,)






;; (def *storage (atom {}))



;; (let [storage (storage *storage)
;;       set     (apply set/sorted-set (range 1000))]
;;   (set/store set storage))
;; ;; => "9fa3baff-0ba8-402f-9fdf-35b014331f03"


;; (let [storage (storage *storage)
;;       set (set/restore "9fa3baff-0ba8-402f-9fdf-35b014331f03" storage)
;;       set (conj set 1005)]
;;   (set/store set storage))
;; ;; => "8aa15f17-2369-45a2-af4c-1fd0a727f7c2"


;; (defn- uri->address [s]
;;   (subs s 1 (count s)))


;; (defn handler [req]

;;   (prn :req)

;;   (let [address (uri->address (:uri req))
;;         node    (@*storage address)]
;;     (if (some? node)
;;       {:status 200
;;        :body   node
;;        :headers {"Content-type" "application/json"
;;                  "Access-Control-Allow-Origin" "*"
;;                  "Cache-control" "public, max-age=604800, immutable"}}
;;       {:status 404})))


;; (def server (jetty/run-jetty #'handler
;;                              {:join? false
;;                               :port 8080}))

;; (.stop server)



(defn resources
  {::di/kind :component}
  [_]
  (reitit.ring/create-resource-handler))

(defn handler
  {::di/kind :component}
  [{route-data     `route-data
    #_#_middleware `middleware}]
  (let [router (reitit.ring/router route-data)]
    (reitit.ring/ring-handler
     router
     (reitit.ring/routes
      (reitit.ring/redirect-trailing-slash-handler {:method :strip})
      (reitit.ring/create-default-handler))
     {#_#_:inject-match?  true
      #_#_:inject-router? true
      #_#_:middleware     middleware})))

(defn jetty
  {::di/stop Server/.stop}
  [{handler `handler}]
  (jetty/run-jetty handler
                   {:join? false
                    :port 8080}))
