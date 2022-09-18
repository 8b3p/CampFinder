const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
	url: String,
	filename: String
})

imageSchema.virtual('thumbnail').get(function () {
	return this.url.replace('/upload', '/upload/w_400');
});

const campgroundSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true,
		min: 0
	},
	description: {
		type: String,
		required: true
	},
	images: [
		imageSchema
	],
	location: {
		type: String,
		required: true
	},
	geometry: {
		type: {
			type: String,
			enum: ['Point'],
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review'
		}
	]
}, { toJSON: { virtuals: true /* this is to include the virtual properties */ } });

//for the cluster map popup
campgroundSchema.virtual('properties.popUpMarkup').get(function () {
	if (this.images.length) {
		return `
	<div class="text-center">
		<a class="h6" style="text-decoration: none;" href="/campgrounds/${this._id}">${this.title}</a>
		<img class="img-thumbnail" src="${this.images[0].thumbnail}">
	</div>`
	} else {
		return `
	<div class="text-center">
		<a class="h6" style="text-decoration: none;" href="/campgrounds/${this._id}">${this.title}</a>
	</div>`
	}
});

campgroundSchema.post('findOneAndDelete', async function (campground) {
	if (campground) {
		await Review.remove({
			_id: {
				$in: campground.reviews
			}
		})
	}
})

module.exports = mongoose.model('Campground', campgroundSchema);