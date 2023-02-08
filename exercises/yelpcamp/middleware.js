const {campgroundSchema,reviewSchema} = require('./schemas.js')


const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'you must be signed in first!')
        return res.redirect('/login')
    }
    next()
}

//server db validation
module.exports.validateCampground = (req,res,next) => {
  
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    } else {
        next()
    }
    // console.log(result)
}

module.exports.isAuthor = async(req,res,next) => {
    const {id} = req.params
    const update = await Campground.findById(id)
    if(!update.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}


//server db validation
module.exports.validateReview = (req,res,next) => {

    const {error} = reviewSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    } else {
        next()
    }
}