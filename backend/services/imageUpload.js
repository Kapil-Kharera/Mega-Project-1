import s3 from '../config/s3.config';

export const s3FileUpload = async ({bucketName, key, body, contentType}) => {
    return await s3.upload({
        //Make sure all keys name are in Capital letter
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType
    })
    .promise()
}

export const s3FileDelete = async ({bucketName, key}) => {
    return await s3.deleteObject({
        Bucket: bucketName,
        Key: key
    })
    .promise()
}
