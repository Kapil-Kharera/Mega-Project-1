import User from '../models/user.schema';
import asyncHandler from '../services/asyncHandler';
import CustomError from '../utils/customError';
import { cookieOptions } from '../utils/cookieOptions';
import mailHelper from '../utils/mailHelper';
import crypto from 'crypto';

/********************** 

*@SIGNUP
*@route http://localhost:4000/api/auth/signup
*@description User signup controller for creating a new user
*@parameters name, email, password
*@return User Object

**************************/

export const signUp = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if(!name || !email || !password) {
        throw new CustomError("Please fill all fields", 400);
    }

    const existingUser = await User.findOne({email});

    if (existingUser) {
        throw new CustomError('User already exists', 400);
    }

    const user = await User.create({
        name, 
        email,
        password //we already encrypt the password in our schemas before saving into db
    });

    const token = user.getJwtToken();
    console.log(user);
    user.password = undefined; //although we don't need it but only for precaution

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
        success: true,
        token,
        user
    })

})

/********************** 

*@LOGIN
*@route http://localhost:4000/api/auth/login
*@description User signIn controller for logging a new user
*@parameters name, email, password
*@return User Object

**************************/

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new CustomError("Please fill all fields", 400);
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new CustomError("Invalid Credentials", 400);
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        throw new CustomError("Invalid credentials - pass", 400);
    }

    const token = user.getJwtToken();
    user.password = undefined;
    
    res.cookie("token", token, cookieOptions);
    
    res.status(200).json({
        success: true,
        token,
        user
    })
});

/********************** 

*@LOOUT
*@route http://localhost:4000/api/auth/logout
*@description User logout by clearing user cookie
*@parameters 
*@return success message

**************************/

export const logout = asyncHandler(async (_req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "Logget Out"
    })

})


/********************** 

*@FORGOT_PASSWORD
*@route http://localhost:4000/api/auth/password/forgot
*@description User will submit email and we will generate a token
*@parameters email
*@return success message - email send

**************************/

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (email === null || email === "") {
        throw new CustomError("Please provide a valid email", 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new CustomError("User not found", 404)
    }

    const resetToken = user.generateForgotPasswordToken();

    await user.save({ validateBeforeSave: false}); //don't validate , just save it

    const resetUrl = `
        ${req.protocol}://${req.get("host")}//api/auth/password/${resetToken}
    `;

    const text = `Your password reset url is \n\n ${resetUrl}\n\n`

    try {
        await mailHelper({
            email: user.email,
            subject: "Password reset email for website",
            text: text,
        })

        res.status(200).json({
            success: true,
            message: `Email send to ${user.email}`
        })
    } catch (error) {
        //roll back - clear fields and save

        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;

        await user.save({ validateBeforeSave: false});

        throw new CustomError(error.message || 'Email send failure', 500)
    }
});


/********************** 

*@RESET_PASSWORD
*@route http://localhost:4000/api/auth/password/reset/:resetToken
*@description User will be able to reset password based on url token
*@parameters token from url, password and confirmPassword
*@return User Object

**************************/

export const resetPassword = asyncHandler(async (req, res) => {
    const { token: resetToken } = req.params; //we calling the token here -> resetToken
    const { password, confirmPassword } = req.body;

    //encrypt the token again , just to match with encypted password in db
    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: resetPasswordToken,
        forgotPasswordExpiry: {$gt: Date.now()}
    });

    if (!user) {
        throw new CustomError("Password token is invalid or expired", 400);
    }

    if (password !== confirmPassword) {
        throw new CustomError("Password and ConfirmPassword does not match", 400);
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    //create a token and send it to user
    const token = user.getJwtToken();
    user.password = undefined;

    //make helper method for cookie
    res.cookie("token", token, cookieOptions);
    
    res.status(200).json({
        success: true,
        user
    })

});

//TODO
// create a controller for change password