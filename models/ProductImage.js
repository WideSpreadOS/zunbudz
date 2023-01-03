const mongoose = require('mongoose');

const productPhotoSchema = new mongoose.Schema({
    for_product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    img:
    {
        data: Buffer,
        contentType: String
    }
});

module.exports = new mongoose.model('ProductImage', productPhotoSchema);