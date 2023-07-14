FROM node:18 as builder

WORKDIR /app

COPY package*.json ./
COPY src/**/ !(src/tests/) /app/src/

RUN yarn install

RUN yarn build
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive \
  --production=false

RUN rm -rf node_modules && \
  NODE_ENV=production yarn install \
  --prefer-offline \
  --pure-lockfile \
  --non-interactive \
  --production=true

FROM node:lts

WORKDIR /app

COPY --from=builder /app  .

ENV HOST 0.0.0.0
EXPOSE 3000

CMD [ "yarn", "start" ]