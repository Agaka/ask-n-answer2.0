const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const session = require("express-session")
const connection = require('./database/database')

const categoriesController = require('./categories/CategoriesController')
const articlesController = require('./articles/ArticlesController')
const usersController = require("./user/UsersController")

const Article = require('./articles/Article')
const Category = require('./categories/Category')
const User = require('./user/User')


// View Engine
app.set('view engine', 'ejs')

// Sessions

app.use(session({
    secret: "aloemcldsf244",
    cookie: {
        maxAge: 30000
    }
}))

// Static
app.use(express.static('public'))

// Body Parses
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Database
connection.authenticate().then(() => {
    console.log("Conexão estabelecida com sucesso")
}).catch((err) => {
    console.log(err)
})

// Routes
app.use("/", categoriesController)
app.use("/", articlesController)
app.use("/", usersController)

app.get("/session", (req, res) => {
    req.session.treinamento = "node"

    res.send("Gerado")
})

app.get("/reading", (req, res) => {
    res.json({
        treinamento: req.session.treinamento
    })
})

app.get("/", (req, res) => {
    Article.findAll({
        order: [
            ["id", "DESC"]
        ],
        limit: 4
    }).then((articles) => {
        Category.findAll().then((categories) => {
            res.render('index', { articles: articles, categories: categories })
        })
    })
})

app.get("/:slug", (req, res) => {
    let slug = req.params.slug
    Article.findOne({
        where: {
            slug: slug
        }
    }).then((article) => {
        if (article != undefined) {
            Category.findAll().then((categories) => {
                res.render('articles', { article: article, categories: categories })
            })
        } else {
            res.redirect("/")
        }
    }).catch((err) => {
        res.redirect("/")
    })
})

app.get("/category/:slug", (req, res) => {
    let slug = req.params.slug

    Category.findOne({
        where: {
            slug: slug
        },
        include: [{ model: Article }]
    }).then((category) => {
        if(category != undefined) {
            Category.findAll().then((categories) => {
                res.render("index", { articles: category.articles, categories: categories})
            })
        } else {
            res.redirect("/")
        }
    }).catch((err) => {
        res.redirect("/")
    })
})

app.listen(3000, () => {
    console.log("Rodando...")
})