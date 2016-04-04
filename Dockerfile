FROM postgres:9.5

RUN apt-get update \
    && apt-get install -y \
    curl 

# install nodejs
RUN curl -sL https://deb.nodesource.com/setup_5.x | bash -
RUN apt-get update && apt-get install -y \
    nodejs

RUN rm -rf /var/lib/apt/lists/*

# get Containerbuddy release
RUN export CB=containerbuddy-1.3.0 &&\
   curl -Lo /tmp/${CB}.tar.gz \
   https://github.com/joyent/containerbuddy/releases/download/1.3.0/${CB}.tar.gz && \
   tar -xf /tmp/${CB}.tar.gz && \
   mv /containerbuddy /bin/

# configure Containerbuddy and Postgres
COPY bin/package.json /bin/
RUN cd /bin && npm i --production

COPY bin/* /bin/
COPY etc/* /etc/

# override parent entrypoint
ENTRYPOINT []

CMD ["/bin/containerbuddy", "/docker-entrypoint.sh", "postgres"]
