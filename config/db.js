const mongoose = require('mongoose');
const config = require('./default');
const mongoURI = config.mongoURI;

const connectDB = async () => {

    try {
        await mongoose.connect(mongoURI, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        console.log('MongoDB connected...');

    } catch (error) {
        console.log(error);
        process.exit(1);
    }

}

module.exports = connectDB;