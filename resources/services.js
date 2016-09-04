var services = {
  baseurl: "http://api.vasttrafik.se/bin/rest.exe/",
  authKey = ""; // Insert your västtrafik authKey here..

  getTrip: function (originId, destId, date, time, maxChanges){
    var max = "";
    if(maxChanges){
      max = "&maxChanges=" + maxChanges;
    }

    return $.ajax({
      type: "GET",
      url: this.baseurl + "trip?originId=" + originId + "&destId=" + destId + "&date=" + date + "&time=" + time + max + "&authKey=" + authKey + "&format=json"
    });
  },

  getLocations: function(input) {
    return $.ajax({
      type: "GET",
      url: this.baseurl + "location.name?input=" + input + "&authKey=" + authKey + "&format=json"
    });
  },

  getDepartures: function (originId, destId) {
    var hej = $.ajax({
      type: "GET",
      url: this.baseurl + "/departureBoard?id=" + originId + /*"&direction=" + destId + */"&date=2015-01-17&time=16:02&authKey=" + authKey + "&format=json"
    });
  }
};
