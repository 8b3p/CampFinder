const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary')

//*geocoding falan
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
//now this has 2 methods, forward and revers grocoding
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken })

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render('campground/index', { campgrounds, title: 'Campgrounds' });
};

module.exports.renderNewForm = (req, res) => {
  res.render('campground/new', { title: 'New' });
}

module.exports.showCampground = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id).populate({
    path: 'reviews',
    populate: {
      path: 'author'
    }
  }).populate('author');
  if (!campground) {
    req.flash('error', 'Cannot find that campground')
    return res.redirect('/campgrounds')
  }
  res.render('campground/show', { campground, title: 'show' });
}

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geoCoder.forwardGeocode({
    query: `${req.body.campground.location}`,
    limit: 1
  }).send()
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
  campground.author = req.user._id;
  await campground.save();
  req.flash('success', 'Successfully made a new campground')
  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.renderEditForm = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Cannot find that campground')
    return res.redirect('/campgrounds')
  }
  res.render('campground/edit', { campground, title: 'edit' });
}

module.exports.editCampground = async (req, res, next) => {
  if (!req.body.campground) throw new ExpressError('missing campground inputs', 400);
  const geoData = await geoCoder.forwardGeocode({
    query: `${req.body.campground.location}`,
    limit: 1
  }).send()
  const Edited = await Campground.findByIdAndUpdate(req.params.id, req.body.campground, { runValidators: true, new: true });
  Edited.geometry = geoData.body.features[0].geometry;
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
  Edited.images.push(...imgs);
  await Edited.save()
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await Edited.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
  }
  console.log(`updated ${Edited.title} campground`);
  req.flash('success', 'Successfully updated campground')
  res.redirect(`/campgrounds/${req.params.id}`);
}

module.exports.deleteCampground = async (req, res, next) => {
  const Deleted = await Campground.findByIdAndDelete(req.params.id);
  for (let image of Deleted.images) {
    await cloudinary.uploader.destroy(image.filename)
  }
  console.log(`Deleted ${Deleted.title} campground`);
  req.flash('success', 'Successfully deleted campground');
  res.redirect('/campgrounds');
}