var Trip = function(rawTrip) {
  var d, o, travelTime;
  var t = rawTrip.Leg,
      changes = 0,
      lines = '';

  if (t.length) {
    for (var j = 0; j < t.length; j++) {
      if (t[j].type !== 'WALK') {
        changes++;
      }

      lines += t[j].sname || t[j].name;
      if (j !== t.length - 1) {
        lines += ', ';
      }
    }

    changes--;
    o = t[0].Origin;
    d = t[t.length - 1].Destination;
  } else {
    changes = 0;
    lines = t.sname || t.name;
    o = t.Origin;
    d = t.Destination
  }

  this.changes = changes;
  this.lines = lines;
  this.origin = moment(o.date + ' ' + o.time);
  this.destination = moment(d.date + ' ' + d.time);
  setRealTimeProperties(this, o, d);
  this.travelTime = this.rtDestination.diff(this.rtOrigin, 'minutes');
  this.minutesOffOrigin = this.rtOrigin.diff(this.origin, 'minutes');
  this.minutesOffDestination = this.rtDestination.diff(this.destination, 'minutes');
  return this;
}

Trip.prototype.getView = function() {
  return {
    changes: this.changes,
    destination: this.destination.format("HH:mm"),
    lines: this.lines,
    minutesOffOrigin: formatMinutesOff(this.minutesOffOrigin),
    minutesOffDestination: formatMinutesOff(this.minutesOffDestination),
    origin: this.origin.format("HH:mm"),
    travelTime: formatTravelTime(this.travelTime)
  }
}

var setRealTimeProperties = function(trip, origin, destination) {
  if(origin.rtDate && origin.rtTime){
    trip.rtOrigin = moment(origin.rtDate + ' ' + origin.rtTime);
  }
  else {
    trip.rtOrigin = trip.origin;
  }

  if (destination.rtDate && destination.rtTime){
    trip.rtDestination = moment(destination.rtDate + ' ' + destination.rtTime);
  }
  else {
    trip.rtDestination = trip.destination;
  }
}

var formatTravelTime = function(travelTimeInMinutes) {
  var hours = Math.floor(travelTimeInMinutes / 60);
  var minutesMinusHours = travelTimeInMinutes - (hours * 60);
  var time = hours + "h " + minutesMinusHours + "min";
  return time;
}

var formatMinutesOff = function(minutes) {
  var m = ''
  if (minutes != 0) {
    m = (minutes > 0 ? '+' : '') + minutes
  }
  return m;
}
