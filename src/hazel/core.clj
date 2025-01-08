(ns hazel.core
  (:require
   borkdude.html
   [clojure.math :as math]
   [clojure.string :as str]
   [darkleaf.di.core :as di]
   [jsonista.core :as json]
   [datascript.core :as d]
   [datascript.storage :as storage]
   [reitit.ring]
   [ring.adapter.jetty :as jetty]
   [ring.util.http-response :as ring.resp])
  (:import
   (org.eclipse.jetty.server Server)
   (com.github.javafaker Faker)))

(set! *warn-on-reflection* true)

(defn start []
  (def system (di/start `jetty
                        (di/add-side-dependency `init)
                        {:number-of-tasks  16 #_256
                         :branching-factor 16 #_64})))

(defn stop []
  (alter-var-root #'system  di/stop))

(defn restart []
  (stop)
  (start)
  nil)

(comment
  (restart)

  (require '[clojure.repl.deps :as repl.deps])
  (repl.deps/sync-deps)

  ,)

(defn cache-busting-key
  "We should invalidate cache in browser after system reloading."
  {::di/kind :component}
  []
  (random-uuid))

(def route-data
  (di/template
   [["/" (di/ref `root)]
    ["/transact" (di/ref `transact)]
    ["/segment/:id" (di/ref `segment)]
    ["/assets/*" (di/ref `resources)]]))


(defn memory
  {::di/kind :component}
  []
  (atom {}))

(defn storage
  {::di/kind :component}
  [{memory `memory}]
  (reify storage/IStorage
    (-store [_ addr+data-seq]
      (doseq [[addr data] addr+data-seq]
        (swap! memory assoc addr data)))
    (-restore [_ addr]

      (prn addr)

      (get @memory addr))))

(defn conn
  {::di/kind :component}
  [{storage          `storage
    branching-factor :branching-factor}]
  (let [schema {:completed {:db/index true}}
        opts   {:branching-factor branching-factor
                :storage          storage}]
    (d/create-conn schema opts)))

(defn remove-t-from-datom [[e a v _t]]
  [e a v])


(defn remove-t [node]
  (-> node
      (update :keys (fn [k]
                      (map remove-t-from-datom
                           k)))))

(defn segment [{memory `memory} req]
  (let [id   (-> req :path-params :id parse-long)
        data (-> memory
                 deref
                 (get id)
                 remove-t
                 json/write-value-as-string)]
    (-> data
        (ring.resp/ok)
        (ring.resp/header "Content-type" "application/json")
        ;; we can do it only in production system
        ;; or we should use cache boosting
        #_(ring.resp/header "Cache-control" "public, max-age=604800, immutable"))))

(defn fix-tx-data [tx-data]
  (for [i tx-data]
    (if (vector? i)
      ;; ["db/retract" ...] -> [:db/retract ...]
      (update i 0 keyword)
      i)))

#_
(defn parse-tail
  "It is correct but inefficient implementation."
  [node]
  (for [tx node]
    (for [[e a v t] tx]
      [e a v (pos? t)])))

(defn parse-tail
 "Trying to collapse all transactions in one.
 This code may be incorect. See implementation above."
 [node]
 (let [all (for [tx node
                 d  tx]
             d)
       gs  (group-by (fn [[e a v t]]
                       [e a v])
                     all)]
   [(for [[[e a v] g] gs
          :let        [n (->> g
                              (map #(nth % 3))
                              (map math/signum)
                              (reduce +))
                       op (pos? n)]
          :when (not= 0.0 n)]
      [e a v op])]))


(defn roots [{memory `memory}]
  (let [mem                      @memory
        {:keys [eavt aevt avet]} (get mem 0)
        tail                     (get mem 1)
        tail                     (parse-tail tail)]
    (-> {:eav  eavt
         :aev  aevt
         :ave  avet
         :tail tail})))


(defn transact [{conn  `conn
                 roots `roots} req]
  (let [tx-data (-> req
                    :body
                    (json/read-value json/keyword-keys-object-mapper)
                    (fix-tx-data))
        db      (d/transact! conn tx-data)])
  (-> (roots)
      (json/write-value-as-string)
      (ring.resp/ok)
      (ring.resp/header "Content-type" "application/json")))

(defn init
  {::di/kind :component}
  [{conn            `conn
    number-of-tasks :number-of-tasks}]
  (let [f  (Faker.)
        db (d/transact! conn (for [_ (range number-of-tasks)]
                               {:title     (.. f food ingredient)
                                :completed (.. f bool bool)}))]
    :ok))

(defn resources
  "Bun does not support manifest files.
  So we can't use cache boost and we have to disable browser caching."
  {::di/kind :component}
  [_]
  (let [h (reitit.ring/create-resource-handler)]
    (fn [req]
      (-> req
          h
          (ring.resp/header "Cache-Control" "no-cache")))))

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


(defn layout [& [{:keys [title
                         head
                         body]
                  :as x}]]
  #html
  [:<>
   [:$ "<!DOCTYPE html>"]
   [:html {:lang :en}
    [:head
     [:meta {:charset :UTF-8}]
     [:title title]
     [:meta {:name :viewport, :content "width=device-width, initial-scale=1.0"}]

     [:link {:rel :icon
             :href "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌳</text></svg>"}]
     head]
    [:body body]]])

(defn html-ok [& opts]
  (-> (layout opts)
      (str)
      (ring.resp/ok)
      (ring.resp/content-type "text/html")))

(defn root [{memory            `memory
             roots             `roots
             cache-busting-key `cache-busting-key} _req]
  (html-ok :title "Орешник"
           :body #html [:<>
                        [:div {:id "app"}]
                        [:script
                         [:$ (str
                              "window.cache_busting_key = "
                              (json/write-value-as-string cache-busting-key))]]
                        [:script
                         [:$ (str
                              "window.initialRoots = "
                              (-> (roots)
                                  (json/write-value-as-string)))]]
                        [:script {:src  "/assets/build/entrypoint.js"
                                  :type :module}]]))
