import Product from '../models/product.schema';
import formidable from 'formidable';
import fs from 'fs';
import {deleteFile, s3FileUpload} from "../services/imageUpload";
import Mongoose from 'mongoose';
import asyncHandler from '../services/asyncHandler';
import CustomError from '../utils/customError';
import s3 from '../config/s3.config';
import config from '../config';


/***************************************************
 *@ADD_PRODUCT
 *@route https://localhost:5000/api/product
 *@description Controller used for creating a new product
 *@description Only admin can create the coupon
 *@description Uses AWS S3 Bucket for image upload

 ***************************************************/

 export const addProduct = asyncHandler(async (req, res) => {
    const form = formidable({
        multiples: true,
        keepExtensions: true,
    });

    form.parse(req, async function (err, fields, files) {
        try {
            if (err) {
                throw new CustomError(err.message || "Something went wrong", 500);
            }
             //generating the cusotm _id with same mechanism like MongoDB bson id
             let productId = new Mongoose.Types.ObjectId().toHexString();
            //  console.log(fields, files);

            //check for fields
            if (!fields.name || 
                !fields.price || 
                !fields.description || 
                !fields.collectionId
                ) {
                    throw new CustomError("Please fill all details", 500);
                }

                //handling images
                //it wrap up all the promise , because every image return a promise
                let imgArrayResp = Promise.all(
                    //although it is already in array form but for surity this line return a array
                    Object.keys(files).map(async (filekey, index) => {
                        //this contain all the info of file
                        const element = files[filekey];

                        const data = fs.readFileSync(element.filepath);

                        const upload = await s3FileUpload({
                            bucketName: config.S3_BUCKET_NAME,
                            key: `products/${productId}photo_${index + 1}.png`,
                            body: data,
                            contentType: element.mimetype,
                        })

                        return {
                            secure_url: upload.Location
                        }
                    })
                );

                let imgArray = await imgArrayResp;

                const product = await Product.create({
                    _id: productId,
                    photos: imgArray,
                    ...fields
                });

                if (!product) {
                    throw new CustomError("Product was not created", 400);
                }

                res.status(200).json({
                    success: true,
                    message: "Here are the products",
                    product
                })
            } catch (error) {
           return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong"
           });
        }
    });
 });