var popup = {
  el: null,
  date: null,
  time: null,
  trips: null,
  settings: {},

  renderTravels: function() {
    var tb = document.querySelector('#travelTbody');
    while(tb.hasChildNodes()) {
      tb.removeChild(tb.lastChild);
    }

    var origin = document.querySelector('#origin');
    origin.setAttribute('placeholder', chrome.i18n.getMessage('originPlaceholder'));
    origin.value = this.settings.origin.label || '';

    var destination = document.querySelector('#destination');
    destination.setAttribute('placeholder', chrome.i18n.getMessage('destinationPlaceholder'));
    destination.value = this.settings.destination.label || '';

    if(this.trips.length) {
      for (var i = 0; i < this.trips.length; i++){
        var t = this.trips[i].getView();
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + t.origin + ' ' + t.minutesOffOrigin + '</td>' +
          '<td>' + t.destination + ' ' + t.minutesOffDestination + '</td>' +
          '<td>' + t.travelTime + '</td>' +
          '<td>' + t.changes + '</td>' +
          '<td><span class="lines">' + t.lines +'</span></td>';
        tb.appendChild(tr);
      }
    }
    else {
      document.querySelector('#errorMessage').text = chrome.i18n.getMessage('error_message');
    }
  },

  updateTravels: function(trips) {
    if(trips) {
      this.trips = trips;
      this.renderTravels();
    }
  },

  onSwapClick: function(el){
    var val = {
      destination: this.settings.origin,
      origin: this.settings.destination
    };

    chrome.storage.sync.set(val, function() {
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.tasks.updateSettings();
      });
    });
  },

  translate: function () {
    var elements = document.querySelectorAll('[data-string]');

    for (var i = 0, len = elements.length; i < len; i++){
      var message = chrome.i18n.getMessage(elements[i].getAttribute('data-string'));
      if (message) {
        elements[i].innerHTML = message;
      }
    }
  },

  init: function () {
    var self = this;
    var optionsButton = document.getElementById("options");
    optionsButton.addEventListener('click', function() {
      chrome.tabs.create({
        url: "src/options.html"
      });
    });

    chrome.runtime.getBackgroundPage(function(backgroundPage) {
      self.trips = backgroundPage.tasks.trips;
      self.settings = backgroundPage.tasks.settings;

      document.querySelector('#swap').addEventListener('click', function(e){
        self.onSwapClick(this);
      });

      self.renderTravels();
      self.translate();
    });
  }
};

document.addEventListener('DOMContentLoaded', function () {
  $(function() {
    $("#tabs").tabs();
  });
  popup.init();
});
