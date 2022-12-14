const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')

const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')
const {campgroundSchema,reviewSchema} = require('./schemas.js')

const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')


require('dotenv').config();



const dbURI = process.env.dbURI
mongoose.connect(dbURI)

const db = mongoose.connection
db.on('error', console.error.bind(console,'connection error'))
db.once('open', () => {
    console.log('db connected')
})

//middleware for ejs, and directory
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(methodOverride('_method')) //for routes other than get and post
app.engine('ejs', ejsMate)
app.use(express.static(path.join(__dirname,'public'))) //allows use of static assets in the public folder

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //expire the cookie a week from now
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use((req,res,next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

//router
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

app.get('/', (req,res) => {
    res.render('home')
})




app.all('*', (req,res,next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err,req,res,next) => {
    const {statusCode = 500,message ='something went wrong'} = err
    if(!err.message) err.message = 'oh noes, something went wrong'
    res.status(statusCode).render('error', {err})
    // res.send('something went wrong')
})

app.listen(3000, () => {
    console.log('listening on port 3000')
})

