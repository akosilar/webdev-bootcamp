const express = require('express')
const app = express()
const morgan = require('morgan')


// app.use(morgan('tiny'))

// app.use((req,res,next) => {
//     req.requestTime = Date.now()
//     // console.log(req.method, req.path) 
//     next()
// })

// app.use('/dogs', (req,res,next) => {
//     console.log('i luv dogs')
//     next()
// })

const verifyPassword = (req,res,next) => {
    const { password } = req.query
    if(password === 'chickennugget') {
        next()
    }
    // else{
    //     res.send('sorry, you need a password')
    // }
    throw new Error('password required')
    // console.log(req.query)
}

app.get('/', (req,res) => {
    console.log(`request date: ${req.requestTime}`)
    res.send('home page')
})

app.get('/error', (req,res) => {
    chicken.fly()
})

app.get('/dogs', (req,res) => {
    console.log(`request date: ${req.requestTime}`)
    res.send('woof woof')
})

app.get('/secret', verifyPassword,(req,res) => {
    res.send('my secret is: is secret my')
})


app.use((req,res) => {
    res.status(404).send('not found')
})

app.use((err,req,res,next) => {
    console.log('****')
    console.log('**error**')
    console.log('****')
    // res.status(500).send('oh boy, error')
    console.log(err)
    next(err)

})

app.listen(3000, () => {
    console.log('app is listening on localhost:3000')
})