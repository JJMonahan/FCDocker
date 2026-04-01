# Use an official Python runtime as a parent image
FROM python:3.10
# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app/

# Install dependencies with SSL certificate bypass for corporate networks
RUN pip install --upgrade pip --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org
RUN pip install -r requirements.txt --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org


# Make port 8000 available to the world outside this container
EXPOSE 8000

# Command to run on container start

ENTRYPOINT ["sh", "entrypoint.sh"]

#RUN executes at build time, not run time - so once when the container is built, but not again when we are just running the container without builing it.
#CMD runs every time the container is started. If docker run command has parametwers then the CMD does not run. If there are multiple CMD lines present only the last CMD actually runs.
#ENTRYPOINT runs when the container is started. It picks up parameters passed on the command line to the docker run command.
#        For example: docker run myimage custom event would pass "custom event" to the script listed in teh ENTRYPOINT command