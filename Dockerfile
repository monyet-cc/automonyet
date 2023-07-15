FROM node:lts-alpine as builder

WORKDIR /app

COPY . .

RUN yarn install \
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive \
  --production=false

RUN yarn build

RUN rm -rf node_modules && \
  NODE_ENV=production yarn install \
  --prefer-offline \
  --pure-lockfile \
  --non-interactive \
  --production=true

FROM node:lts-alpine

# Install tzdata package
RUN apk add --no-cache tzdata

# Set the timezone to Asia/Kuala_Lumpur
ENV TZ=Asia/Kuala_Lumpur

WORKDIR /app

COPY --from=builder /app  .

ENV HOST 0.0.0.0

CMD [ "node", "./dist/index.js" ]