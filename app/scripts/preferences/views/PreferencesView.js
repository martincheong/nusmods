define([
  'underscore',
  'backbone.marionette',
  'hbs!../templates/preferences',
  'localforage'
],

function(_, Marionette, template, localforage) {
  'use strict';

  var $body = $('body');

  function getThemeOptions () {
    var optionValues = []
    $('#theme-options').children('option').each(function() {
      optionValues.push($(this).val());
    });
    return optionValues;
  }

  var PreferencesView = Marionette.Layout.extend({
    template: template,
    initialize: function() {
      // TODO: Populate default values of form elements for first time users.
      var formElements = {
        'faculty': '#faculty',
        'student': 'input:radio[name="student-radios"]',
        'mode': 'input:radio[name="mode-radios"]',
        'theme': '#theme-options'
      }
      _.each(formElements, function (selector, item) {
        localforage.getItem(item, function (value) {
          if (value) {
            $(selector).val([value]); 
          }
        })
      });

      var that = this;
      $body.keydown(function ($ev) {
        var keyCode = $ev.keyCode;
        var LEFT_ARROW_KEY = 37;
        var RIGHT_ARROW_KEY = 39;
        if (keyCode != LEFT_ARROW_KEY && keyCode != RIGHT_ARROW_KEY) { return; }

        var $themeOptions = $('#theme-options');
        if ($themeOptions.length) {
          // So that arrow events are prevented on non-preferences pages.
          var optionValues = getThemeOptions();
          var newIndex = Math.min(Math.max(optionValues.indexOf($themeOptions.val()) + (keyCode == LEFT_ARROW_KEY ? -1 : +1), 0), optionValues.length - 1);
          var newTheme = optionValues[newIndex];
          $themeOptions.val(newTheme);
          that.savePreference('theme', newTheme);
        }
      });
    }, 
    events: {
      'click .random-theme': 'randomTheme',
      'change #faculty, input:radio[name="student-radios"], input:radio[name="mode-radios"], #theme-options': 'updatePreference',
      'keydown': 'toggleTheme'
    },
    randomTheme: function () {
      var optionValues = getThemeOptions();
      var $themeOptions = $('#theme-options');

      do {
        var value = optionValues[Math.floor(Math.random() * (optionValues.length))];
      } while (value === $themeOptions.val());

      $themeOptions.val(value);
      this.savePreference('theme', value);
    },
    updatePreference: function ($ev) {
      var $target = $($ev.target);
      $target.blur();
      var property = $target.attr('data-pref-type');
      var value = $target.val();
      this.savePreference(property, value);
    },
    savePreference: function (property, value) {
      if (property === 'faculty' && value === 'default') {
        alert('You have to select a faculty.');
        localforage.getItem(property, function (value) {
          $('#faculty').val(value);
        });
        return;
      }
      localforage.setItem(property, value);
      if (property === 'mode' || property === 'theme') {
        this.updateAppearance(property, value);
      }      
    },
    updateAppearance: function (property, value) {
      
      var $body = $('body');
      $body.attr('data-' + property, value);      
      $body.removeClass();

      _.each(['mode', 'theme'], function (prop) {
        $body.addClass(prop + '-' + $body.attr('data-' + prop));
      });
      
      if (property === 'mode') {
        var cssFile = value !== 'default' ? 'styles/' + value + '.min.css' : '';
        $('#mode').attr('href', cssFile);
      }
    }
  });

  return PreferencesView;
});
