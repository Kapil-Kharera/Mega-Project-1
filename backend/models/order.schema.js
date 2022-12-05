import mongoose from 'mongoose';
import ProductStatus  from '../utils/productStatus';

const orderSchema = new mongoose.Schema(
    {
        products: {
            type: [
                {
                    productId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Product",
                        required: true //optionally
                    },
                    count: Number,
                    price: Number
                }
            ],
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId, //_id
            ref: "User",
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        coupon: String,
        transactionId: String,
        status: {
            type: String,
            enum: Object.values(ProductStatus),
            default: ProductStatus.ORDERED
        },
        //You can track paymentMode - UPI,creaditCard,wallet,COD
    }, 
    {
        timestamps: true
    }
    );