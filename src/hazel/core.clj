(ns hazel.core
  (:require
   borkdude.html
   [clojure.string :as str]
   [darkleaf.di.core :as di]
   [jsonista.core :as json]
   [me.tonsky.persistent-sorted-set :as set]
   [reitit.ring]
   [ring.adapter.jetty :as jetty]
   [ring.util.http-response :as ring.resp])
  (:import
   #_(clojure.lang IDeref)
   (me.tonsky.persistent_sorted_set IStorage Branch Leaf Settings)
   (org.eclipse.jetty.server Server)))

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
