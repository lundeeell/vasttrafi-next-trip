chrome.runtime.onInstalled.addListener(function() {
  tasks.updateSettings();
});

chrome.runtime.onStartup.addListener(function() {
  tasks.updateSettings();
});


chrome.alarms.onAlarm.addListener(function(alarm) {
  if(alarm.name === 'fetchLatest') {
    tasks.settings && tasks.getTrips(tasks.settings.origin.value.id, tasks.settings.destination.value.id, tasks.settings.maxTime, tasks.settings.maxChanges);
  }
  else if (alarm.name === 'updateBadge'){
    tasks.updateBadge();
  }
});

var tasks = {
  date: null,
  time: null,
  settings: {},
  trips: [],

  setAlarm: function(alarm) {
    alarm === 'fetchLatest' && chrome.alarms.create(alarm, { periodInMinutes: parseInt(this.settings.refresh)} );
    alarm === 'updateBadge' && chrome.alarms.create(alarm, { periodInMinutes: 1} );
  },

  updateSettings: function () {
    var self = this;
    chrome.storage.sync.get({
      origin: {},
      destination: {},
      maxTime: 0,
      maxChanges: 0,
      refresh: 5
    }, function (items) {
      self.settings.origin = items.origin || null;
      self.settings.destination = items.destination || null;
      self.settings.maxTime = items.maxTime || 0;
      self.settings.maxChanges = items.maxChanges || false;
      self.settings.refresh = items.refresh || 5;

      self.settings && self.getTrips(self.settings.origin.value.id, self.settings.destination.value.id, self.settings.maxTime, self.settings.maxChanges);
      self.setAlarm('fetchLatest');
      self.setAlarm('updateBadge');
    });
  },

  saveSettings: function (val) {
    var _this = this;
    chrome.storage.sync.set(val, function() {
      _this.updateSettings();
    });
  },

  getTrips: function(originId, destId, maxTime, maxChanges) {
    var self = this;
    var date = moment().format("YYYY-MM-D");
    var time = moment().format("HH:mm");
    services.getTrip(originId, destId, date, time, maxChanges).done(function(result){
      var tl = result.TripList.Trip;
      if(tl && tl.length){
        self.setTrips(tl, maxTime);
        self.updateBadge();

        var popup = chrome.extension.getViews({type: "popup"});
        if(popup.length){
          popup[0].popup.updateTravels(self.trips);
        }
      }
    });
  },

  setTrips: function(trips, maxTime){
    this.trips = [];
    for(var i = 0; i < trips.length; i++){
      trip = new Trip(trips[i]);
      if (trip.travelTime <= maxTime || maxTime == 0) {
        this.trips.push(trip);
      }
    }
  },

  updateBadge: function () {
    if (!this.trips.length) {
      return;
    }

    var nextTrip = this._findNextTrip(this.trips);
    if (nextTrip === null) {
      return;
    }

    this._setBadgeBackgroundColor(nextTrip);
    this._setBadgeText(nextTrip);
  },

  _findNextTrip: function(trips) {
    var nextTrip = null;
    var now = moment();
    var diff;

    for (var i = trips.length - 1; i >= 0; i--) {
      if(trips[i].rtOrigin){
        diff = trips[i].rtOrigin.diff(now)
      }
      else {
        diff = trips[i].origin.diff(now)
      }
      if (diff >= 0) {
        nextTrip = trips[i];
      }
    }
    return nextTrip;
  },

  _setBadgeBackgroundColor: function(trip) {
    var gray = '#666'
    var red = '#F00'

    var color = gray;
    if (trip.minutesOffOrigin != 0) {
      color = red;
    }

    chrome.browserAction.setBadgeBackgroundColor({
      color: color
    });
  },

  _setBadgeText: function(trip) {
    var now = moment();
    var timeToDeparture = trip.rtOrigin ? trip.rtOrigin.diff(now, 'minutes') : trip.origin.diff(now, 'minutes');

    chrome.browserAction.setBadgeText({
      text: timeToDeparture.toString()
    });
  }
}

tasks.updateSettings();
