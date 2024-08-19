## Build
FROM soerenmeier/chuchi-build

COPY --chown=build . .

# first build the wasm
WORKDIR wasm

RUN riji build

# then build the ui
WORKDIR ../ui

RUN npm ci
RUN npm run build

# now build the server
WORKDIR ../server

RUN cargo b --release

WORKDIR ..

## release
FROM soerenmeier/chuchi-release

COPY --chown=release --from=0 /home/build/target/release/server .
COPY --chown=release --from=0 /home/build/ui/dist ui

CMD ["./server"]

# CMD ["/bin/bash"]
