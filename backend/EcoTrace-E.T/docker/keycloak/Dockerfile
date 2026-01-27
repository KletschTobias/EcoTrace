# keycloak/Dockerfile
FROM quay.io/keycloak/keycloak:24.0.5

WORKDIR /opt/keycloak

# Realm-Konfiguration ins Import-Verzeichnis kopieren
COPY eco-tracer-realm.json /opt/keycloak/data/import/eco-tracer-realm.json