const express = require('express')
const app = express ();
const path = require('path')
const mongoose = require('mongoose')


const Product = require('./models/product')
const Farm = require('./models/farm')

const methodOverride = require('method-override')
const AppError = require('./appError')

mongoose.connect('mongodb://localhost:27017/farmStandTake2')
.then(() => {
    console.log('mongo connection open')
})
.catch(err => {
    console.log('oh noes. Mongo connection problem')
    console.log(err)
})




app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(methodOverride('_method'))

//farm routes
app.get('/farms', async(req,res) => {
    const farms = await Farm.find({})
    res.render('farms/index', {farms})
})

app.get('/farms/new', (req,res) => {
    res.render('farms/new')
})

app.post('/farms', async (req,res) => {
    const farm = new Farm(req.body)
    await farm.save()
    res.redirect('/farms')
})

app.get('/farms/:id', async(req,res) => {
    const farm = await Farm.findById(req.params.id).populate('products')
    res.render('farms/show', {farm})
})

app.get('/farms/:id/products/new', async (req,res) => {
    const {id} = req.params
    const farm = await Farm.findById(id)
    res.render('products/new', {categories, farm})
})

app.post('/farms/:id/products', async (req,res) => {
    const {id} = req.params
    const farm = await Farm.findById(id)
    
    const {name, price, category} = req.body
    const product = new Product({name,price,category})
    farm.products.push(product)
    product.farm = farm
    await farm.save()
    await product.save()
    res.redirect(`/farms/${farm._id}`)
})

app.delete('/farms/:id', async(req,res) => {
    const farm = await Farm.findByIdAndDelete(req.params.id)
    
    res.redirect('/farms')
})

//product routes


const categories = ['fruit', 'vegetable', 'dairy', 'mushrooms']

//display all products
app.get('/products', wrapAsync(async (req,res,next) => {
    
    const {category} = req.query
    if(category){
        const products = await Product.find({category})
        res.render('./products/index', {products, category})

    } else {
        const products = await Product.find({})
        res.render('./products/index', {products, category: 'All'})

    }
   
    // console.log(products)
}))

//show create a product
app.get('/products/new', (req,res) => {
    // throw new AppError('Not allowed', 401)
    res.render('./products/new', {categories})
})

function wrapAsync(fn) {
    return function(req,res,next) {
        fn(req,res,next).catch(e => next(e))
    }
}

//show product detail
app.get('/products/:id', wrapAsync(async (req,res,next) => {
    
        const {id} = req.params
        const product = await Product.findById(id).populate('farm','name')
        if(!product) {
        throw next(new AppError('product not found', 404))
        }
        res.render('./products/detail', {product})
        console.log(product)
    
}))

//show edit product
app.get('/products/:id/edit', wrapAsync(async (req,res,next) => {
    
        const {id} = req.params
        const product = await Product.findById(id)
        if(!product) {
            throw next(new AppError('product not found', 404))
        }
        res.render('./products/edit', {product, categories})
        console.log(product)
   
}))

//add the new product to the db
app.post('/products', wrapAsync(async (req,res,next) => {
    
        const {name, price, category} = req.body
        const newProduct = new Product({name, price, category})
        await newProduct.save()
        console.log(name, price, category)
        res.redirect(`/products/${newProduct.id}`)
   
    
}))

//edit the product in the db
app.put('/products/:id', wrapAsync(async (req,res,next) => {
    // console.log(req.body)

   
        const {id} = req.params
        const {name, price, category} = req.body
        const productUpdate = await Product.findByIdAndUpdate(id, {name,price,category}, {runValidators: true, new: true})
        res.redirect(`/products/${productUpdate._id}`)
   
    
}))

//delete the product in the db
app.delete('/products/:id', wrapAsync(async (req,res) => {
    const {id} = req.params
    const product = await Product.findByIdAndDelete(id)
    res.redirect('/products')

}))

const handlevalidationErr = err => {
    console.dir(err)
    return new AppError(`Validation failed...${err.message}`,400)
}

app.use((err,req,res,next) => {
    console.log(err.name)
    if (err.name === 'ValidationError') err = handlevalidationErr(err)
    next(err)
})

app.use((err,req,res,next) => {
    const {status = 500, message = 'something went wrong'} = err
    res.status(status).send(message)
})

app.listen(3000, () => {
    console.log("app is listening on 3000")
})

