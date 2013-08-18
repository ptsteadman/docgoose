module.exports = {

    sortSchoolsByDistanceFrom: function(schools, latitude, longitude) {
        console.log("sorting schools");

        var length = schools.length;
        for (var i = 0; i < length; i++) {
            console.log(schools[i].name + " : ");
            module.exports.computeDistanceFromSchool(schools[i], latitude, longitude);
        }

        schools.sort(function (a, b) {
            if (a.distance > b.distance) {
                return 1;
            }
            return -1;
        });
    },

    computeDistanceFromSchool: function(school, latitude, longitude) {
        school.distance = module.exports.computeDistanceBetween(school.latitude, school.longitude, latitude, longitude);
    },

    computeDistanceBetween: function(latitude1, longitude1, latitude2, longitude2) {
        console.log("Computing the distance between (" + latitude1 + ", " + longitude1 + ") and (" + latitude2 + ", " + longitude2 + ").");
        var xDistance = latitude1 - latitude2;
        var yDistance = longitude1 - longitude2;
        return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
    }
}