(ns hazel.core
  (:require
   borkdude.html
   [clojure.string :as str]
   [darkleaf.di.core :as di]
   [jsonista.core :as json]
   #_[me.tonsky.persistent-sorted-set :as set]
   [datascript.core :as d]
   [datascript.storage :as storage]
   [reitit.ring]
   [ring.adapter.jetty :as jetty]
   [ring.util.http-response :as ring.resp])
  (:import
   #_(clojure.lang IDeref)
   (java.util Comparator)
   (me.tonsky.persistent_sorted_set PersistentSortedSet IStorage Branch Leaf Settings RefType)
   (org.eclipse.jetty.server Server)
   (com.github.javafaker Faker)))

(set! *warn-on-reflection* true)

(comment
  (def system (di/start `jetty
                        (di/add-side-dependency `init)
                        {:number           3
                         :branching-factor 64}))
  (di/stop system)


  (require '[clojure.repl.deps :as repl.deps])
  (repl.deps/sync-deps)

  ,)


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
  (reify datascript.storage/IStorage
    (-store [_ addr+data-seq]
      (doseq [[addr data] addr+data-seq]
        (swap! memory assoc addr data)))))

(defn conn
  {::di/kind :component}
  [{storage          `storage
    branching-factor :branching-factor}]
  (let [schema {:completed {:db/index true}}
        db     (d/empty-db schema
                           {:branching-factor branching-factor
                            :storage          storage})]
    (atom db)))


(defn segment [{memory `memory} req]
  (let [id   (-> req :path-params :id parse-long)
        data (-> memory
                 deref
                 (get id)
                 json/write-value-as-string)]
    (-> data
        (ring.resp/ok)
        (ring.resp/header "Content-type" "application/json")
        (ring.resp/header "Cache-control" "public, max-age=604800, immutable"))))

(defn fix-tx-data [tx-data]
  (for [i tx-data]
    (if (vector? i)
      ;; "db/retract" -> :db/retract
      (update i 0 keyword)
      i)))

;; d/transact! пишет tail, что нам не нужно
(defn transact! [{conn `conn} tx-data]
  (locking conn
    (let [tx-data (fix-tx-data tx-data)
          db      @conn
          db      (d/db-with db tx-data)
          _       (storage/store db)
          _       (reset! conn db)]
      db)))

(defn roots [{memory `memory}]
  (let [{:keys [eavt aevt avet]}
        (get @memory 0)]
    (-> {:eav eavt
         :aev aevt
         :ave avet})))


(defn transact [{transact! `transact!
                 roots     `roots} req]
  (locking roots
    (let [tx-data (-> req
                      :body
                      (json/read-value json/keyword-keys-object-mapper))
          db      (transact! tx-data)])
    (-> (roots)
        (json/write-value-as-string)
        (ring.resp/ok)
        (ring.resp/header "Content-type" "application/json"))))

(defn init
  {::di/kind :component}
  [{conn   `conn
    number :number}]
  (locking conn
    (let [f  (Faker.)
          db @conn
          db (d/db-with db (for [_ (range number)]
                             {:title     (.. f food ingredient)
                              :completed (.. f bool bool)}))
          _  (storage/store db)]
      (reset! conn db)
      :ok)))

(comment
  ;; если не пользоваться transact! то он не пишет tail
  (di/with-open [[storage memory] (di/start [`storage `memory])]
    (let [schema {:i {:db/index true}
                  :j {:db/index true}}
          db     (d/empty-db schema {:branching-factor 4
                                     :storage          storage})
          db     (d/db-with db (for [i (range 4)
                                     j (range 4)]
                                 {:i i
                                  :j j}))
          _      (storage/store db)]
      #_(-> memory deref (get 0) (select-keys [:eavt :aevt :avet]))
      (spit "ij.json" (json/write-value-as-string @memory))))


  (di/with-open [[storage memory] (di/start [`storage `memory])]
    (let [schema {:i {:db/index true}
                  :j {:db/index true}}
          db     (d/empty-db schema {:branching-factor 4
                                     :storage          storage})
          db     (d/db-with db (for [i (range 4)
                                     j (range 4)]
                                 {:i i
                                  :j j}))
          _      (storage/store db)]


      (spit "avet.json" (json/write-value-as-string
                         (map (juxt :e :a :v)
                              (d/datoms db :avet))))))



  ,,,)

;; transact! не перестраивает дерево, если мало датом,
;; и это по идее хорошо
;; еще storage/store почему-то возвращает базу, а не новый корень
;; особые адреса:
;; 0 - это номер базы
;; 1 - это хвост, который не проиндексировали



(defn resources
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

     head]
    [:body body]]])

(defn html-ok [& opts]
  (-> (layout opts)
      (str)
      (ring.resp/ok)
      (ring.resp/content-type "text/html")))

(defn root [{memory `memory
             roots  `roots} _req]
  (html-ok :title "Орешник"
           :body #html [:<>
                        [:div {:id "app"}]
                        [:script
                         [:$ (str
                              "window.initialRoots = "
                              (-> (roots)
                                  (json/write-value-as-string)))]]
                        [:script {:src  "/assets/build/entrypoint.js"
                                  :type :module}]]))
