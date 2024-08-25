# Use the Cypress image with Cypress pre-installed
FROM cypress/included:13.13.1

# Set the working directory
WORKDIR /app

# Copy the necessary files
COPY package*.json ./

# Install any additional dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Run the UAT tests
CMD ["npm", "run", "UAT"]
