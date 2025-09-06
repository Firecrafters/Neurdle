FROM node:22-bullseye

# Install necessary packages for development
RUN apt-get update && apt-get install -y \
    git \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Add node user to sudoers for container setup
RUN echo "node ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

WORKDIR /workspace

# Set ownership of the workspace directory to the existing node user
RUN chown -R node:node /workspace

# Ensure the node user has proper permissions to its home directory
# Create the home directory if it doesn't exist and set proper ownership
RUN mkdir -p /home/node && chown -R node:node /home/node

# Create .vscode-server directory with proper permissions
RUN mkdir -p /home/node/.vscode-server/bin && \
    chown -R node:node /home/node/.vscode-server

RUN mkdir -p /home/node/.vscode-server/neurdle && \
    chown -R node:node /home/node/.vscode-server/neurdle && \
    chmod -R 755 /home/node/.vscode-server/neurdle

USER node

CMD sleep infinity
