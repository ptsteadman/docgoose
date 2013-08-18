var motherGoose = require('./mothergoose');
var geoip = require('geoip-lite');
var AWS = require('aws-sdk');
var format = require('util').format;
var fs = require('fs');
var distanceSorter = require('../util/distanceSorter');
var schools = [{"name":"cornell","latitude":42.4479,"longitude":-76.4779},{"name":"mcgill","latitude":45.5085,"longitude":-73.5797},{"name":"berkeley","latitude":37.8717,"longitude":-122.2610},{"name":"georgia tech","latitude": 33.7756,"longitude":-84.3963},{"name":"harvard","latitude":42.3762,"longitude":-71.1158},{"name":"illinois","latitude":40.0401,"longitude":-88.2707},{"name":"michigan","latitude":42.3184,"longitude":-83.2300},{"name":"mit","latitude":42.3584,"longitude":-71.0912},{"name":"nyu","latitude":40.7296,"longitude":-73.9952},{"name":"ohio state","latitude":40.7976,"longitude":-82.5818},{"name":"penn state","latitude":40.7982,"longitude":-77.8599},{"name":"purdue","latitude":40.4246,"longitude":-86.9107},{"name":"rutgers","latitude":40.5010,"longitude":-74.4473},{"name":"stanford","latitude":37.4278,"longitude":-122.1697},{"name":"texas","latitude":30.2879,"longitude":-97.7278},{"name":"texas a&m","latitude":30.6090,"longitude":-96.3492},{"name":"toronto","latitude":43.6602,"longitude":-79.3943},{"name":"usc","latitude":34.0223,"longitude":-118.2851},{"name":"virgina_tech","latitude":38.8967,"longitude":-77.1894},{"name":"washington","latitude":47.6556,"longitude":-122.3091},{"name":"yale","latitude":41.3104,"longitude":-72.9290}];

exports.index = function (req, res) {
    //get IP address and send to correct school
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip);
    var location = geoip.lookup(ip);
	if (location) {
	    //distanceSorter.sortSchoolsByDistanceFrom(schools,46,-74); //test...should return McGill
		distanceSorter.sortSchoolsByDistanceFrom(schools,location.ll[0],location.ll[1]);
		console.log(location);	
		res.redirect('/' + schools[0].name);
	} else {
		res.redirect('/cornell'); //default if location can not be found
	}	
};

exports.school = function (req, res) {
    var school = req.params.name;
    console.log(school);
    res.render('index', {
        title: school
    })
}

exports.getClassJSON = function (req, res) {
    res.render('index', {
        title: 'getClassJson'
    });
};

exports.getSchoolJSON = function (req, res) {
    res.render('index', {
        title: 'getSchoolJson'
    });
};

exports.uploadForm = function (req, res) {
    res.send('<form method="post" enctype="multipart/form-data">' + '<p>File Name: <input type="text" name="title" /></p>' + '<p>File: <input type="file" name="file" /></p>' + '<p><input type="submit" value="Upload" /></p>' + '</form>');
}

exports.upload = function (req, res) {
    var s3 = new AWS.S3(); // Based on Glacier's example: http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/examples.html#Amazon_Glacier__Multi-part_Upload

    // File
    var fileName = req.files.file.name;
    var filePath = req.files.file.path;
    var fileKey = fileName;
    var buffer = fs.readFileSync(filePath);
    // S3 Upload options
    var bucket = 'cornell-dochub';

    // Upload
    var startTime = new Date();
    var partNum = 0;
    var partSize = 1024 * 1024 * 5; // Minimum 5MB per chunk (except the last part) http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadComplete.html
    var numPartsLeft = Math.ceil(buffer.length / partSize);
    var maxUploadTries = 3;
    var multiPartParams = {
        Bucket: bucket,
        Key: fileKey,
        ContentType: 'application/pdf'
    };
    var multipartMap = {
        Parts: []
    };

    function completeMultipartUpload(s3, doneParams) {
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
    }

    function uploadPart(s3, multipart, partParams, tryNum) {
        var tryNum = tryNum || 1;
        s3.uploadPart(partParams, function (multiErr, mData) {
            if (multiErr) {
                console.log('multiErr, upload part error:', multiErr);
                if (tryNum < maxUploadTries) {
                    console.log('Retrying upload of part: #', partParams.PartNumber)
                    uploadPart(s3, multipart, partParams, tryNum + 1);
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
            completeMultipartUpload(s3, doneParams);
        });
    }

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
            uploadPart(s3, multipart, partParams);
        }
    });

    //res.render('index', { title: 'upload' });
    res.send(format('\nuploaded %s (%d Kb) to %s as %s', req.files.file.name, req.files.file.size / 1024 | 0, req.files.file.path, req.body.title));

};