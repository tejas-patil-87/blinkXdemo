# Use an official Node runtime as a base image
FROM cypress/browsers

# crete the folder to project will stored
RUN mkdir /Blinkx-cypress

# Set the working directory
WORKDIR /Blinkx-cypress

# Copy package.json and package-lock.json to the working directory
COPY package.json .

# Copy package-lock.json
COPY package-lock.json .

# Copy the Cypress configuration
COPY cypress.config.js .

# Copy other necessary files
COPY delete-report.js .
COPY emailConfig.json .
COPY send_report_email_main.js .
COPY run-scripts.sh .

# Install dependencies
RUN npm install


# Copy the application code to the working directory
COPY . .

# # Expose the port (if needed)
# EXPOSE 3000

ENTRYPOINT ["npx","cypress","run"]

# Give execute permissions to the script (if needed)
RUN chmod +x run-scripts.sh

# Run the script
CMD [""]