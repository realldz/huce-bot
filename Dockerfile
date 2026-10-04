# Stage 1: Install dependencies
FROM oven/bun:1 AS installer
WORKDIR /usr/src/app

# Copy package manifests
COPY bun.lock .
COPY package.json .

# Install dependencies
RUN bun install --frozen-lockfile

# Stage 2: Create the production image
FROM oven/bun:1-slim
WORKDIR /usr/src/app

# Copy installed dependencies from the installer stage
COPY --from=installer /usr/src/app/node_modules ./node_modules

# Copy the rest of the application source code
COPY . .

# Expose any necessary ports if your application is a server
# (Uncomment the line below and change the port if needed)
# EXPOSE 3000

# The command to run the application
CMD ["bun", "run", "start"]
