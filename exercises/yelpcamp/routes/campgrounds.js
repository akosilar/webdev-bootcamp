const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const {campgroundSchema} = require('../schemas.js')
const {isLoggedIn} = require('../middleware');
const campground = require('../models/campground');


//server db validation
const validateCampground = (req,res,next) => {
  
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    } else {
        next()
    }
    // console.log(result)
}



//show a list of campgrounds
router.get('/', async (req,res) => {
   const campgrounds = await Campground.find({})
   res.render('campgrounds/index',{campgrounds})
})

//show add new campground page
router.get('/new', isLoggedIn, (req,res) => {
    res.render('campgrounds/new')
})
//add the new campground to db
router.post('/', isLoggedIn,validateCampground,catchAsync(async (req,res,next) => {
    // if(!req.body.campground) throw new ExpressError('invalid campground data', 400)

    const campground = new Campground(req.body.campground)
    campground.author = req.user._id;
    await campground.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)

}))

//show campground detail
router.get('/:id',catchAsync(async (req,res) => {
    const search = await Campground.findById(req.params.id).populate('reviews').populate('author')
    if(!search) {
        req.flash('error', 'Cannot find that campground!')
        res.redirect('/campgrounds')
    }else{
        res.render('campgrounds/show',{search})

    }
}))

//show edit campground
router.get('/:id/edit',isLoggedIn,catchAsync(async(req,res) => {
    const {id} = req.params
    const search = await Campground.findById(id)
    if(!search) {
        req.flash('error', 'Cannot find that campground!')
        res.redirect('/campgrounds')
    }
    else {
        if(!search.author.equals(req.user._id)){
            req.flash('error', 'You do not have permission to do that!')
            return res.redirect(`/campgrounds/${id}`)
        }
        res.render('campgrounds/edit',{search})

    }
}))

//submit the campground edit to db
router.put('/:id',isLoggedIn,validateCampground,catchAsync(async(req,res) => {

    const {id} = req.params
    const update = await Campground.findById(id)
    if(!update.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${update._id}`)
}))

//delete the campground from db
router.delete('/:id', isLoggedIn,catchAsync(async(req,res) => {
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}))
module.exports = router