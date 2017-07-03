´´´
traefik_debug:
    build:
        context: ./test/fixtures/traefik_debug
    ports:
        - "3000"
    labels:
        - traefik.backend=nctest
        - traefik.frontend.entryPoints=http
        - traefik.frontend.rule=Host:localhost;PathPrefixStrip:/test,PathPrefix:/dist2
    environment:
        - DEBUG=*
´´´
