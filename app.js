const express = require('express');
const shortId = require('shortid');
const createHttpError = require('http-errors');
const mongoose = require('mongoose');
const path = require('path')
const ShortUrl = require('./models/url-model');

const app = express();
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false}))


mongoose.connect('mongodb://localhost:27017', {
    dbName: 'url-shortner',
    userNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(()=> console.log('mongoose connected'))
.catch((error) => console.log('Error connecting..'))


app.set('view engine', 'ejs')

app.get('/', async (req, res, next) => {
    res.render('index')
})

app.post('/', async (req, res, next) => {
    try {
        const { url } = req.body
        if(!url) {
            throw createHttpError.BadRequest('Provide a valid url')
        }
        const urlExist = await ShortUrl.findOne({ url })
        if (urlExist) {
            res.render('index', {short_irl: `http://localhost:3000/${urlExist.shortId}`})
            return 
        }

        const shortUrl = new ShortUrl({url: url, shortId: shortId.generate()})
        const result = await shortUrl.save()
        res.render('index', {short_url: `http://localhost:3000/${result.shortId}`,
    })
    } catch(error) {
        next(error)
    }
})

app.use((req, res, next) => {
    next(createHttpError.NotFound())
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('index', {error: err.message})
})


app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));