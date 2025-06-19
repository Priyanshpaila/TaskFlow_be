const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const helmet = require("helmet");
const cors = require("cors");
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
const divisionRoutes = require("./routes/divisionRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use("/api/divisions", divisionRoutes);


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
