const express = require('express');
const https = require('https');
const app = express(https);
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const methodOverride = require('method-override');
const multer = require('multer');
const gridfsBucket = require('gridfs-bucket')
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const crypto = require('crypto');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs')
const mongoStore = require('connect-mongo').default;
// DB Config
const db = require('./config/keys').MongoURI;
const Product = require('./models/Product');
const Company = require('./models/Company');
const ProductImage = require('./models/ProductImage');
const MongoStore = require('connect-mongo');
//const CompanyImage = require('./models/CompanyImage');

// Connect to MongoDB
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
    })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));


// Favicon
app.use(favicon(path.join(__dirname, 'public', 'kicks101_logo_1a1a1a.ico')))

// Middleware
app.use(bodyParser.json());

// Static
app.use(express.static('public'));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// Express Session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: db }),
    cookie: { maxAge: 180 * 60 * 1000 }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Method Override
// Connect Flash
app.use(flash());

// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.session = req.session;
    res.locals.user = req.user || null

    next();
});

// Multer
let gfs;

//Init gfs
const conn = mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true })

conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})


//Create storage object
const storage = new GridFsStorage({
    url: db,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = 'kicks-101_photo_' + buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });



// Routes

app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));
app.use('/user', require('./routes/user'));
app.use('/raffle', require('./routes/raffle'));
app.use('/search', require('./routes/search'));
app.use('/cart', require('./routes/cart'));
app.use('/products', require('./routes/products'));
app.use('/todo', require('./routes/todo'));



/* SITE MANAGMENT 


app.get('/files', async (req, res) => {
    const companies = await Company.find()
    const allImages = await ProductImage.find()
    const productImages = await Product.find().populate('images').exec()

    gfs.files.find().toArray((err, files) => {
        // Check if Files
        if (!files || files.lenth === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }

        // Files do exist
        console.log(files)
        return res.render('admin/images/all-images', {  page: "All Images", allImages, companies, files, productImages })
    })
    




gfs.files.find().toArray((err, files) => {
        // Check if Files
        if (!files || files.lenth === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        } else {

            
            // Files do exist
            console.log(files)
        })
        } 

})



app.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if Files
        if (!file || file.lenth === 0) {
            return res.status(404).json({
                err: 'That file does not exist'
            });
        }

        // Files do exist
        return res.render('admin/images/single-image-file', { page: "Single Image", file })

    })
})

app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if Files
        if (!file || file.lenth === 0) {
            return res.status(404).json({
                err: 'That file does not exist'
            });
        }

        // Files do exist
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read the output to the stream
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            })
        }
    })
})

app.delete('/delete-image/:fileId', (req, res) => {
    const fileId = req.params.fileId;
    console.log(`File ID being deleted: ${fileId}`);
    gfs.remove({ _id: fileId, root: 'uploads' }, (err, gridFSBucket) => {
        if (err) {
            return res.status(404).json({ err: err });
        } else {
            res.redirect('/files')
        }
    });
});

 
app.post('/upload-item-image/:itemId', upload.single('item_image'), (req, res) => {
    const itemId = req.params.itemId;
    const obj = {
        for_product: itemId,
        img: {
            data: req.file.filename,
            contentType: 'image/png'
        }
    }
    ProductImage.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            item.save();
            console.log(`For Product: ${itemId} Image Data: ${obj.img.data}`);
            const newImage = obj.img.data;
            Product.findByIdAndUpdate(itemId,
                { $addToSet: { photos: req.file.filename } },
                { safe: true, upsert: true },
                function (err, doc) {
                    if (err) {
                        console.log(err)
                    } else {
                        return
                    }
                }
            )
            res.redirect(`/admin/products/edit/${itemId}`);
        }
    })
});

 */

// 404 Page
app.use(async function (req, res) {
    res.status(400);
    const companies = await Company.find()
    res.render('404', { title: '404: File Not Found', companies });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on ${PORT}`))