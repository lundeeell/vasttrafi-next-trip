var quicksearch = {
  init: function() {
    this.addAutoCompleteToEl('origin');
    this.addAutoCompleteToEl('destination');
  },

  addAutoCompleteToEl: function(name) {
    var self = this;
    $('#' + name).autocomplete({
      minLength: 1,
      messages: {
        noResults: '',
        results: function() {}
      },
      source: this._getLocations,

      focus: function(event, ui){
        $('#' + name).val(ui.item.label);
        return false;
      },
      select: function(event, ui){
        if(ui.item) {
          $('#' + name).val(ui.item.label);
          self.save_options(name, ui.item);
        }
        return false;
      }
    }).data("autocomplete")._renderItem = function( ul, item ) {
      return $("<li>")
        .append("<a>" + item.label + "</a>")
        .appendTo(ul);
    };
  },

  _getLocations: function(request, response) {
    services.getLocations(request.term).done(function(result) {
      var locations = result.LocationList.StopLocation.slice(0, 12);
      response($.map(locations, function(loc) {
        return {
          label: loc.name,
          value: loc
        };
      }));
    });
  },

  // Saves options to background page
  save_options: function(option, value) {
    var val = {};
    val[option] = value;

    chrome.runtime.getBackgroundPage(function(backgroundPage) {
      backgroundPage.tasks.saveSettings(val);
    });
  }
};


document.addEventListener('DOMContentLoaded', function() {
  quicksearch.init();
});
