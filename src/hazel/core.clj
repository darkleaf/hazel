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
  (def system (di/start `jetty))
  (di/stop system)


  (require '[clojure.repl.deps :as repl.deps])
  (repl.deps/sync-deps)

  ,)


(def route-data
  (di/template
   [["/" (di/ref `root)]
    ["/tests" (di/ref `tests)]
    ["/assets/*" (di/ref `resources)]]))

(defn layout [& [{:keys [title
                         importmap
                         head
                         body]
                  :or   {importmap {}}
                  :as x}]]
  #html
  [:<>
   [:$ "<!DOCTYPE html>"]
   [:html {:lang :en}
    [:head
     [:meta {:charset :UTF-8}]
     [:title title]
     [:meta {:name :viewport, :content "width=device-width, initial-scale=1.0"}]
     [:script {:type :importmap}
      [:$ (json/write-value-as-string importmap)]]
     head]
    [:body body]]])

(defn html-ok [& opts]
  (-> (layout opts)
      (str)
      (ring.resp/ok)
      (ring.resp/content-type "text/html")))


(defn root [_ _req]
  (html-ok :title "Орешник"))

(defn tests [_ _req]
  (html-ok
   {:title "Tests"

    :importmap
    {:imports {"hazel/" "./assets/"
               "chai"   "https://cdn.jsdelivr.net/npm/chai/+esm"}}

    :head
    #html
    [:<>
     [:link {:rel :stylesheet, :href "https://unpkg.com/mocha/mocha.css"}]]

    :body
    #html
    [:<>
     [:div {:id "mocha"}]
     [:script {:src "https://unpkg.com/mocha/mocha.js"}]

     [:script {:type :module, :class :mocha-init}
      [:$ "mocha.setup('bdd');
           mocha.checkLeaks();"]]

     [:script {:type :module}
      [:$ "import 'hazel/sum.test.js'"]]

     [:script {:type :module, :class :mocha-exec}
      [:$ "mocha.run();"]]]}))

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


(comment
  ;; если не пользоваться transact! то он не пишет tail
  (di/with-open [[storage memory] (di/start [`storage `memory `db-indices])]
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


  (di/with-open [[storage memory] (di/start [`storage `memory `db-indices])]
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
