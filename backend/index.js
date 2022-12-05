import mongoose from 'mongoose';
import app from './app';
import config from './config/index';

//create a fn and execute it
(async () => {
    try {
        await mongoose.connect(config.MONGO_URL);
        console.log("DB connected");

        app.on('error', (err) => {
            console.log("ERROR : ", err);
            throw err;
        });

        const onListening = () => {
            console.log(`Listening on ${config.PORT}`)
        }

        app.listen(config.PORT, onListening);
    } catch (error) {
        console.log("Error : ", error);
        throw error;
    }
})();