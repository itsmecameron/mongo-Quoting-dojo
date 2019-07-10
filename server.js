var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
const flash = require('express-flash');
var session = require('express-session');

app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: "Don't forget about us!",
    saveUninitialized: true,
    cookie: {
        maxAge: 60000
    }
}))
app.use(flash());

app.use(bodyParser.urlencoded({
    extended: true
}));


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/basic_mongoose');

// ----------------------------------------------------

var QuoteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quote: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})
mongoose.model('Quote', QuoteSchema);
var Quote = mongoose.model('Quote');

// --------------------------------------------------

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/quote/process', (req, res) => {
    console.log("POST DATA", req.body);
    // create a new quote with the name and age corresponding to those from req.body
    var quote = new Quote({
        name: req.body.name,
        quote: req.body.quote
    }, {
        timestamps: req.body.created_at
    });
    // Try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
    quote.save(function (err) {
        // if there is an error console.log that something went wrong!
        if (err) {
            console.log('something went wrong');
            for (var key in err.errors) {
                req.flash('reg', err.errors[key].message);
            }
            res.redirect('/');
        } else { // else console.log that we did well and then redirect to the quote page
            console.log('successfully added a quote!');
        }
        res.redirect('/quote');
    })
})
app.get('/quote', function (req, res) {
    Quote.find({}, (err, quote_results) => {
        if (err) {
            console.log("Error finding quotes")
            res.render("quotes", {
                err: err
            })
        } else {
            console.log(quote_results)
            res.render("quotes", {
                quotes: quote_results
            })
        }
    })
})

app.listen(8000, function () {
    console.log("listening on port 8000");
})