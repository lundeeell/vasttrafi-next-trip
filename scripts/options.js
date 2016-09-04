var options = {
  maxtimeTimeout: null,
  refreshTimeout: null,

  init: function () {
    var self = this;
    this.restore_options();

    this.translate();

    document.querySelector('#maxTime').addEventListener('keyup', function() {
      self.maxtimeTimeout = self.resetTimeout(self.maxtimeTimeout, 'maxTime', this.value);
    });

    document.querySelector('#refresh').addEventListener('keyup', function(){
      self.refreshTimeout = self.resetTimeout(self.refreshTimeout, 'refresh', this.value);
    });

    var maxChangesSelect = document.getElementById('maxChanges');
    for (var i = 0; i < 10; i++){
      var option = document.createElement('option');
      option.value = i;
      option.text = i;
      maxChangesSelect.appendChild(option);
    }

    maxChangesSelect.addEventListener('change', function() {
      self.save_options("maxChanges", this.value);
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

  resetTimeout: function(timeout, option, value) {
    var self = this;
    clearTimeout(timeout);
    return setTimeout(function(){
      self.save_options(option, value);
    }, 700);
  },

  // Saves options to chrome.storage
  save_options: function(option, value) {
    var val = {};
    val[option] = value;

    chrome.storage.sync.set(val, function() {
      // Update status to let user know options were saved.
      var status = document.querySelector('#status');
      status.innerText = chrome.i18n.getMessage('saveSuccess');
      setTimeout(function() {
        status.innerText = chrome.i18n.getMessage('status_upToDate');
      }, 1200);
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.tasks.updateSettings();
      });
    });
  },

  restore_options: function() {
    chrome.storage.sync.get({
      maxTime: 0,
      maxChanges: false,
      refresh: 5
    }, function(items) {
      document.querySelector('#maxTime').value = items.maxTime;
      document.querySelector('#maxChanges').value = items.maxChanges;
      document.querySelector('#refresh').value = items.refresh;
    });
  }
};

document.addEventListener('DOMContentLoaded', function() {
  options.init();
});
