var AWS = require('aws-sdk');
var fs = require('fs');
var multipartMap = {
    Parts: []
};
var numPartsLeft;
var bucket;
var fileKey;
var starTime;
var acceptedFileTypes = require('../JSON/acceptedFileTypes');

module.exports = {
    uploadFile: function (req) {
        var s3 = new AWS.S3(); // Based on Glacier's example: http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/examples.html#Amazon_Glacier__Multi-part_Upload

        // File
        console.dir(req.files.file);
        var fileName = req.files.file.name;
        var filePath = req.files.file.path;
        fileKey = fileName;
        var buffer = fs.readFileSync(filePath);
        // S3 Upload options
        bucket = 'cornell-dochub';

        // Upload
        startTime = new Date();
        var partNum = 0;
        var partSize = 1024 * 1024 * 5; // Minimum 5MB per chunk (except the last part) http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadComplete.html
        numPartsLeft = Math.ceil(buffer.length / partSize);
        var maxUploadTries = 3;
		var fileType = req.files.file.type;
        var multiPartParams = {
            Bucket: bucket,
            Key: fileKey,
            ContentType: fileType
        };
		
		
		var isAcceptedFileType = false;
		var typesLength = acceptedFileTypes.length;
		for (var i = 0; i < typesLength; i++) {
			console.dir(acceptedFileTypes[i]);
			if (fileType == acceptedFileTypes[i].mimeType) {
				isAcceptedFileType = true;
			}
		}
		if (!isAcceptedFileType) {return;}
		
        console.log(multiPartParams.ContentType);


        // Multipart
        console.log("Creating multipart upload for:", fileKey);
        s3.createMultipartUpload(multiPartParams, function (mpErr, multipart) {
            if (mpErr) {
                console.log('Error!', mpErr);
                return;
            }
            console.log("Got upload ID", multipart.UploadId);

            // Grab each partSize chunk and upload it as a part
            for (var rangeStart = 0; rangeStart < buffer.length; rangeStart += partSize) {
                partNum++;
                var end = Math.min(rangeStart + partSize, buffer.length),
                    partParams = {
                        Body: buffer.slice(rangeStart, end),
                        Bucket: bucket,
                        Key: fileKey,
                        PartNumber: String(partNum),
                        UploadId: multipart.UploadId
                    };

                // Send a single part
                console.log('Uploading part: #', partParams.PartNumber, ', Range start:', rangeStart);
                module.exports.uploadPart(s3, multipart, partParams);
            }
        });
    },

    completeMultipartUpload: function (s3, doneParams) {
        s3.completeMultipartUpload(doneParams, function (err, data) {
            if (err) {
                console.log("An error occurred while completing the multipart upload");
                console.log(err);
            } else {
                var delta = (new Date() - startTime) / 1000;
                console.log('Completed upload in', delta, 'seconds');
                console.log('Final upload data:', data);
            }
        });
    },

    uploadPart: function (s3, multipart, partParams, tryNum) {
        var tryNum = tryNum || 1;
        s3.uploadPart(partParams, function (multiErr, mData) {
            if (multiErr) {
                console.log('multiErr, upload part error:', multiErr);
                if (tryNum < maxUploadTries) {
                    console.log('Retrying upload of part: #', partParams.PartNumber)
                    module.exports.uploadPart(s3, multipart, partParams, tryNum + 1);
                } else {
                    console.log('Failed uploading part: #', partParams.PartNumber)
                }
                return;
            }
            multipartMap.Parts[this.request.params.PartNumber - 1] = {
                ETag: mData.ETag,
                PartNumber: Number(this.request.params.PartNumber)
            };
            console.log("Completed part", this.request.params.PartNumber);
            console.log('mData', mData);
            if (--numPartsLeft > 0) return; // complete only when all parts uploaded

            var doneParams = {
                Bucket: bucket,
                Key: fileKey,
                MultipartUpload: multipartMap,
                UploadId: multipart.UploadId
            };

            console.log("Completing upload...");
            module.exports.completeMultipartUpload(s3, doneParams);
        });
    }
}