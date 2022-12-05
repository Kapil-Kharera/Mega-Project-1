import User from '../models/user.schema';
import asyncHandler from '../services/asyncHandler';
import CustomError from '../utils/customError';
import { cookieOptions } from '../utils/cookieOptions';

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

    const user = User.findOne({ email }).select("+password");

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
