import Collection from '../models/collection.schema';
import asyncHandler from '../services/asyncHandler';
import CustomError from '../utils/customError';

/********************** 
*@CREATE_COLLECTION
*@REQUEST_TYPE GET
*@route http://localhost:4000/api/auth/profile
*@description check for token and populate req.user
*@parameters 
*@return User Object

**************************/

export const createCollection = asyncHandler(async (req, res) => {
    //take name from frontend
    const { name } = req.body;

    if (!name) {
        throw new CustomError("Collection name is required", 400);
    }

    //add this name to database
    const collection = await Collection.create({name});

    //send this response value to frontend
    res.status(200).json({
        success: true,
        message: "Collection created with success",
        collection
    })

});


/********************** 
*@UPDATE_COLLECTION
*@REQUEST_TYPE GET
*@route http://localhost:4000/api/auth/profile
*@description check for token and populate req.user
*@parameters 
*@return User Object

**************************/

export const updateCollection = asyncHandler(async(req, res) => {
    //get existing value to be updates
    const { id: collectionId } = req.params;

    //new value to get updated
    const { name } = req.body;

    if (!name) {
        throw new CustomError("Collection name is required", 400);
    }

    let updatedCollection = await Collection.findByIdAndUpdate(
        collectionId,
        {
            name,
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updateCollection) {
        throw new CustomError("Collection is not found", 400);
    }

    //send a response
    res.status(200).json({
        success:true,
        message: "Collection updated successfully",
        updateCollection
    })
});


/********************** 
*@DELETE_COLLECTION
*@REQUEST_TYPE GET
*@route http://localhost:4000/api/auth/profile
*@description check for token and populate req.user
*@parameters 
*@return User Object

**************************/

export const deleteCollection = asyncHandler(async (req, res) => {
    const {id: collectionId} = req.params;

    const collectionToDelete = await Collection.findByIdAndDelete(collectionId);

    if (!collectionToDelete) {
        throw new CustomError("Collection not found", 400);
    }

    //free the memory(optional step)
    collectionToDelete.remove();

    //send response
    res.status(200).json({
        success: true,
        message: "Collection deleted successfully",
        collectionToDelete //if you don't want to send the deleted collection, then you can skip it.
    })
});


/********************** 
*@GET_ALL_COLLECTION
*@REQUEST_TYPE GET
*@route http://localhost:4000/api/auth/profile
*@description check for token and populate req.user
*@parameters 
*@return User Object

**************************/

export const getAllCollections = asyncHandler(async (req, res) => {
    const collections = await Collection.find();

    if (!collections) {
        throw new CustomError("No collection found", 400);
    }

    res.status(200).json({
        success: true,
        message: "List of all the collections",
        collections
    })
});