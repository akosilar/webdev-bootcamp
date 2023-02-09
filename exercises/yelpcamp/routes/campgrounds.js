const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const {isLoggedIn,isAuthor,validateCampground} = require('../middleware');
const campground = require('../models/campground');



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
    const search = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    console.log(search)
    if(!search) {
        req.flash('error', 'Cannot find that campground!')
        res.redirect('/campgrounds')
    }else{
        res.render('campgrounds/show',{search})

    }
}))

//show edit campground
router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(async(req,res) => {
    const {id} = req.params
    const search = await Campground.findById(id)
    if(!search) {
        req.flash('error', 'Cannot find that campground!')
        res.redirect('/campgrounds')
    }
    else {
        
        res.render('campgrounds/edit',{search})

    }
}))

//submit the campground edit to db
router.put('/:id',isLoggedIn,isAuthor,validateCampground,catchAsync(async(req,res) => {

    const {id} = req.params
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${camp._id}`)
}))

//delete the campground from db
router.delete('/:id', isLoggedIn,isAuthor,catchAsync(async(req,res) => {
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}))
module.exports = router