FROM node:22-alpine

RUN apk add git

WORKDIR /app

# Create a non-root user with the same UID/GID as the default node user
RUN addgroup -S node && adduser -S node -G node

# Set ownership of the application directory
RUN chown -R node:node /app

USER node

CMD sleep infinity
