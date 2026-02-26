#!/bin/sh
set -e

if [ "${RUN_DB_MIGRATIONS}" = "true" ]; then
  echo "Running database migrations (prisma migrate deploy)..."
  node node_modules/prisma/build/index.js migrate deploy
fi

echo "Starting application..."
exec node server.js
