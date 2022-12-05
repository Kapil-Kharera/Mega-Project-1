import mongoose from "mongoose";
import AuthRoles from '../utils/authRoles';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            maxLength: [50, "Name must be less than 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minLength: [6, "Password must be atleast 6 characters"]
        },
        role: {
            type: String,
            enum: Object.values(AuthRoles),//return a array of object values
            default: AuthRoles.USER
        },
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date
    },
    {
        timestamps: true
    }
);

//challenge -1 encrypt password - with mongoose hooks
userSchema.pre("save", async function(next) {
    if (!this.modified("password")) return next();//if password is not modified then return from here otherwise encrypt it
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//add more featrues directly to your schema
userSchema.methods = {
    //compare password
    comparePassword: async function(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
    },

    //genrate jwt token
    getJwtToken: function() {
        return JWT.sign(
            {
                _id: this._id,
                role: this.role
            },
            config.JWT_SECRET,
            {
                expiresIn: config.JWT_EXPIRY
            }
        );
    },

    //genrate forgotPassword Token
    generateForgotPasswordToken: function() {
        const forgotToken = crypto.randomBytes(20).toString('hex');

        //step-1 - save to DB
        //Additional - encrypted the token ,if any reason our db is exposed
        //And this also save in db , because we apply this method to schema
        this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex");

        this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000
        
        //step-2 - return values to user
        return forgotToken;
    }
}

export default mongoose.model("User", userSchema);

