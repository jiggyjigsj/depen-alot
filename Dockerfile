# Use the official Python base image
FROM python:3.9

# Set the working directory inside the container
WORKDIR /code

COPY . /code

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--reload"]
