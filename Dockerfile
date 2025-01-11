FROM oven/bun:alpine AS js
WORKDIR /app

COPY package.json bun.lockb .
RUN bun i

COPY . /app
RUN bun run build-docker


FROM clojure:temurin-21-tools-deps
WORKDIR /app

COPY deps.edn .
RUN clojure -P

COPY --from=js /app/resources/public/build /app/resources/public/build

COPY . .
CMD clojure -X hazel.core/-main
