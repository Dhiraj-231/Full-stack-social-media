import express from "express";
import database from "./configs/database.js";
import dotenv from "dotenv";
import router from "./routes/post.js";
import router1 from './routes/user.js'
import cookieParser from "cookie-parser";
dotenv.config({ path: "./configs/config.env" });
const app = express();
database();
console.log("Database connect successfully");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use("/post", router);
app.use("/user", router1)
app.get("/", (req, res) => {
    res.send("Hii i am your server");
});

app.listen(process.env.PORT_NUM, () => {
    console.log(`Server run at http://localhost:${process.env.PORT_NUM}`);
})