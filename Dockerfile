FROM gcr.io/distroless/nodejs24-debian12 AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

# Copy production deps
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copy build output
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/config ./config

# Optional runtime config
COPY --from=builder /usr/src/app/.sequelizerc ./.sequelizerc

# Use built-in nonroot user
USER nonroot

EXPOSE 3000

CMD ["dist/server.js"]
