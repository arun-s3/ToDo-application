const express = require('express');
const path = require('node:path')

require('dotenv').config()

const connectDB = require("./Config/database.js");

const app = express()

connectDB()

const nocache = require('nocache')
app.use(nocache())

app.use('/Public',express.static(path.join(__dirname,'/Public')))

app.use(express.json());
app.use(express.urlencoded({extended: true, limit:'10mb'}))
const cookieParser = require('cookie-parser')
app.use(cookieParser())

app.set("trust proxy", 1)

const cors = require('cors')
app.use(
    cors({
        origin: [process.env.CLIENT_URL, "http://localhost:3000"],
        method: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "Content-Type", "Authorization", "x-guest-id"   
        ],
        credentials: true,
    }),
)
app.options("*", cors()) 

const globalErrorHandler = require('./Middlewares/globalError.js')

const authRoutes = require('./Routes/user.route.js')
const taskRoutes = require('./Routes/tasks.route.js')
const dashboardRoutes = require("./Routes/dashboard.route.js")

app.use('/', authRoutes)
app.use('/tasks', taskRoutes)
app.use("/dashboard", dashboardRoutes)

app.use(globalErrorHandler)

const port = process.env.PORT || 3001
app.listen(port, ()=>{ console.log(`Listening to port ${port}...`)})


