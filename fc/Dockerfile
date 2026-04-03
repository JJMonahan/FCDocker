# Use an official Python runtime as a parent image
FROM python:3.10

# Install Node.js for contract testing tools (corporate network friendly)
RUN apt-get update && apt-get install -y curl ca-certificates && \
    curl -fsSL --insecure https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs npm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory to /app
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY requirements.txt package.json ./

# Install Python dependencies
RUN pip install --upgrade pip --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org
RUN pip install -r requirements.txt --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org

# Install Node.js dependencies with corporate network configuration
RUN npm config set strict-ssl false && \
    npm config set registry http://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-factor 2 && \
    npm config set fetch-timeout 60000 && \
    npm install --no-audit --no-fund

# Copy the rest of the application
COPY . /app/


# Make port 8000 available to the world outside this container
EXPOSE 8000

# Command to run on container start

ENTRYPOINT ["sh", "entrypoint.sh"]

#RUN executes at build time, not run time - so once when the container is built, but not again when we are just running the container without builing it.
#CMD runs every time the container is started. If docker run command has parametwers then the CMD does not run. If there are multiple CMD lines present only the last CMD actually runs.
#ENTRYPOINT runs when the container is started. It picks up parameters passed on the command line to the docker run command.
#        For example: docker run myimage custom event would pass "custom event" to the script listed in teh ENTRYPOINT command