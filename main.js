"use strict"

/*
こんにちは。　やらの課題です。。w

ごめんなさい。。
17日の夜に提出しましたが、18の夜に完成させます。!!!
なので18日の夜以降に採点お願いします。

難しいです。。。w
デザイン崩れていると思いますが、、許してください。。w

一回めの提出のコードより、少しはみやすくなっていると思います。
あと、メモリも１回めよりは軽くなってると思います。。。
無駄なコード等も一応削除しておきました。。。w
*/

const express = require("express")
const app = express()
const router = require("./routes/index")
const layouts = require("express-ejs-layouts")
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const expressSession = require("express-session")
const cookieParser = require("cookie-parser")
const connectFlash = require("express-flash")
const passport = require("passport")
const User = require("./models/user")

mongoose.Promise = global.Promise
mongoose.connect("mongodb://0.0.0.0:27017/unko_channel_2_5")
    .then(() => {console.log("Successfully Connect MongoDb")})
    .catch(error => {throw error})

app.set("port", process.env.PORT || 3000)
app.set("view engine", "ejs")
app.set("token", process.env.TOKEN || "helloToken0")

app.use(express.static("public"))
app.use(layouts)
app.use(
    express.urlencoded( {
        extended: false
    })
)

app.use(
    methodOverride("_method", {
        methods: ["POST", "GET"]
    })
)

app.use(express.json())
app.use(cookieParser("secret_passcode"))
app.use(
    expressSession({
        secret: "secret_passcode",
        cookie: {
            maxAge: 4000000
        },
        resave: false,
        saveUninitialized: false
    })
)

app.use(passport.initialize())
app.use(passport.session())
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(connectFlash())

app.use((req, res, next) => {
    res.locals.loggedIn = req.isAuthenticated()
    res.locals.currentUser = req.user
    res.locals.flashMessages = req.flash()
    next()
})

app.use("/", router)

const list = ["ApexLegends", "MonsterHunter", "Splatoon", "ARK", "SmashBros", "Nier:Automata"]
const Category = require("./models/category")

Category.findOne({title: list[0]})
    .then((category) => {
        if (!category) {
            list.forEach(category => {
                const categoryParams = { title: category }
                Category.create(categoryParams)
                    .then(() => {
                        console.log("successfully")
                    })
                    .catch(error => {
                        console.log("error main->Category.create")
                        throw error
                    })
            })
        }
    })
    .catch(error => {
        console.log("error main->Category.findOne")
        throw error
    })

app.listen(app.get("port"), () => {
    console.log(`Server starting at http://localhost:${app.get("port")}`)
})
