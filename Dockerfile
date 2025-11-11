FROM node:24-alpine AS base

# RUN npm config set unsafe-perm true

RUN apk add --no-cache cairo jpeg pango giflib

FROM base AS builder

RUN apk --update add --virtual build-dependencies python3 make gcc g++  \
 && npm install -g node-gyp

RUN apk add --no-cache cairo-dev jpeg-dev pango-dev giflib-dev

WORKDIR /chart-server

COPY package*.json ./

RUN npm ci --omit=optional --omit=dev #|| ( sleep 3600 && return -1 )

FROM builder AS compiler

WORKDIR /chart-server

RUN npm ci --omit=optional #|| ( sleep 3600 && return -1 )

COPY *config*.json ./
COPY webpack* ./
COPY test/** ./test/
COPY src/** ./src/

RUN npm test
RUN npm run build

FROM base as runtime

RUN apk add --no-cache \
    ttf-freefont

WORKDIR /chart-server

COPY --from=builder /chart-server/ .
COPY --from=compiler /chart-server/out ./out/
COPY --from=compiler /chart-server/dist ./dist/

COPY assets/* ./assets/


#ENV PORT 33456
#ENV HOST 0.0.0.0

EXPOSE 3478

#CMD node --icu-data-dir=node_modules/full-icu out/index.js || sleep 1800

CMD node --icu-data-dir=node_modules/full-icu out/index.js