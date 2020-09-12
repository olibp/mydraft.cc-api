############################
# Build environment
FROM node:12-alpine AS BUILD_ENV

# Install dependencies
RUN apk --no-cache add \
    python \
    make \
    g++

# Set workdir and copy package files
COPY . ./app
WORKDIR /app

# Install main
RUN npm install --loglevel=error


############################
# Copy from build and run
FROM node:12-alpine
WORKDIR /app
COPY --from=BUILD_ENV /app .
CMD ["npm", "start"]
EXPOSE 8080