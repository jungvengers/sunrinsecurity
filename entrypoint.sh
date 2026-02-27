#!/bin/sh
set -e

if [ "${RUN_DB_MIGRATIONS}" = "true" ]; then
  if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo "Running database migrations (prisma migrate deploy)..."
    node node_modules/prisma/build/index.js migrate deploy
  else
    echo "No Prisma migrations found. Syncing schema with prisma db push..."
    node node_modules/prisma/build/index.js db push --skip-generate
  fi
fi

echo "Starting application..."
exec node server.js
