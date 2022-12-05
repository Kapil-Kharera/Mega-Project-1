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