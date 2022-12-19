const express = require('express')
const app = express()

app.get('/greet', (req,res) => {
    res.send('hey there!')
})

app.get('/setname' , (req,res) => {
    res.cookie('name', 'stevie chicks')
    res.cookie('animal', 'harlequin shrimp')
    res.send('ok sent you a cookie!')
})

app.listen(3000, () =>  {
    console.log('serving')
})