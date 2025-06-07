# Use the official Node 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies without devDependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Set environment variables
ENV PORT=8000
ENV MONGO_URI=mongodb://192.168.13.84/taskFlow
ENV JWT_SECRET=edff5khwd32987dkjqa3wkluier89
ENV JWT_EXPIRE=1d




# Expose your app port
EXPOSE ${PORT}

# Run the app with node (not nodemon)
CMD ["node", "server.js"]



# docker build  --no-cache -t 192.168.13.72:5000/rr_taskflow_be .      
# docker run -d --name rr_taskflow_be -p 8000:8000 rr_taskflow_be_image

# docker tag rr_taskflow_be_image 192.168.13.72:5000/rr_taskflow_be
# docker push 192.168.13.72:5000/rr_taskflow_be
# docker pull 192.168.13.72:5000/rr_taskflow_be
# docker run -d --name rr_taskflow_be -p 8000:8000 192.168.13.72:5000/rr_taskflow_be
