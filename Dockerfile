FROM quay.io/keycloak/keycloak:26.4


COPY realm-export.json /opt/keycloak/data/import/realm-export.json

# build otimizado
RUN /opt/keycloak/bin/kc.sh build


ENTRYPOINT ["/opt/keycloak/bin/kc.sh","start","--optimized","--import-realm","--hostname-strict=false","--proxy=edge"]
