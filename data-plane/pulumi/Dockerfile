FROM pulumi/pulumi-nodejs:3.38.0-debian

# Install Node v18.0.0+ for Fetch
ENV NODE_VERSION 18.7.0

ENV NVM_DIR /root/.nvm
ENV NVM_INSTALL_PATH $NVM_DIR/versions/node/v$NODE_VERSION

RUN apt-get update \
   && apt-get install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

SHELL [ "/bin/bash", "-l", "-c" ]
RUN source $NVM_DIR/nvm.sh \
   && nvm install $NODE_VERSION \
   && nvm alias default $NODE_VERSION \
   && nvm use default

ENV NODE_PATH $NVM_INSTALL_PATH/lib/node_modules
ENV PATH $NVM_INSTALL_PATH/bin:$PATH

COPY . /usr/examples/
WORKDIR /usr/examples/data-plane/pulumi

RUN ["yarn", "install"]
RUN ["yarn", "build"]

ENTRYPOINT ["yarn", "docker-reconcile"]
