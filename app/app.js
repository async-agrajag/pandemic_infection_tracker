'use strict';

var pandemicInfectionTrackerApp = angular.module('pandemicInfectionTrackerApp',[]);
pandemicInfectionTrackerApp.directive('fileOnChange', function() {
                return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                var onChangeFunc = scope.$eval(attrs.fileOnChange);
                element.bind('change', onChangeFunc);
                }
                };
                });

function infectionController($scope) {
    $scope.card_lists = {
    master: [],
    forecast: [],
    epochs: [[]]
    };
    $scope.editing_card = false;
    $scope.editing_modifiers = false;
    $scope.editing_infection_rates = false;
    $scope.card_being_edited = null;
    $scope.modifiers_being_edited = null;
    $scope.infection_rates_being_edited = null;
    $scope.edit_column = null;
    $scope.edit_index = null;
    $scope.current_epoch = 0;
    $scope.input_color = 'blue';
    $scope.input_name = '';
    $scope.forecasting = false;
    $scope.forecast_list_set = false;
    $scope.forecast_list_drawn = false;
    $scope.modifier_list = ['None'];
    $scope.infection_rates = [2,2,2,3,3,4,4,5];
    $scope.version_add_location = 'available_versions';
    $scope.load_filename = '';
    $scope.startNewGame = function () {
        var confirmed = confirm('Are you sure you want to abandon this game and start another?');
        if (confirmed) {
            $scope.startNewGameConfirmed();
        }
    }
    $scope.startNewGameConfirmed = function () {
        $scope.card_lists.forecast = [];
        $scope.card_lists.epochs = [[]];
        for (var index in $scope.card_lists.master) {
            var card = $scope.card_lists.master[index];
            for (var version in card.drawn_versions) {
                card.available_versions[version] = card.available_versions[version] || 0;
                card.available_versions[version] += card.drawn_versions[version];
            }
            card.drawn_versions = {};
        }
        $scope.editing_card = false;
        $scope.editing_modifiers = false;
        $scope.card_being_edited = null;
        $scope.modifiers_being_edited = null;
        $scope.edit_column = null;
        $scope.edit_index = null;
        $scope.current_epoch = 0;
        $scope.input_color = 'blue';
        $scope.input_name = '';
        $scope.forecasting = false;
    }
    $scope.saveText = function (text, filename){
        var a = document.createElement('a');
        a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
        a.setAttribute('download', filename);
        a.click();
    };
    $scope.saveGame = function () {
        $scope.saveText(JSON.stringify({
                               'card_lists': $scope.card_lists,
                               'current_epoch': $scope.current_epoch,
                               'forecasting': $scope.forecasting,
                               'modifier_list': $scope.modifier_list,
                               'infection_rates': $scope.infection_rates
                               }) , 'pandemic_infection_tracker.json');
    };
    $scope.loadGame = function (element) {
        var confirmed = confirm('Are you sure you want to abandon this game and load another?');
        if (confirmed) {
            $scope.loadGameConfirmed(element);
        }
        element.value = null;
    };
    $scope.loadGameConfirmed = function (element) {
        var reader = new FileReader();
        var json;
        
        // Closure to capture the file information.
        reader.onload = (function (theFile) {
                         return function (e) {
                         try {
                         json = JSON.parse(e.target.result);
                         $scope.$apply(function () {
                                       $scope.card_lists = json.card_lists;
                                       $scope.current_epoch = json.current_epoch;
                                       $scope.forecasting = json.forecasting;
                                       $scope.modifier_list = json.modifier_list;
                                       $scope.infection_rates = json.infection_rates;
                                       });
                         } catch (ex) {
                         alert('ex when trying to parse json = ' + ex);
                         }
                         }
                         })(element.files[0]);
        reader.readAsText(element.files[0]);

    };
    $scope.moveForecastCardUp = function (card_index) {
        console.log(card_index);
        $scope.card_lists.forecast.splice(card_index - 1, 0, $scope.card_lists.forecast.splice(card_index, 1)[0]);
    }
    $scope.moveForecastCardDown = function (card_index) {
        console.log(card_index);
        $scope.card_lists.forecast.splice(card_index + 1, 0, $scope.card_lists.forecast.splice(card_index, 1)[0]);
    }
    $scope.startForecasting = function () {
        $scope.forecasting = true;
        $scope.forecast_list_set = false;
        $scope.forecast_list_drawn = false;
    }
    $scope.stopForecasting = function () {
        $scope.forecasting = false;
        $scope.forecast_list_set = false;
        $scope.forecast_list_drawn = false;
    }
    $scope.editCard = function (card_column_id, card_color, card_name) {
        var card_column = null;
        switch (card_column_id) {
            case "master":
                card_column = $scope.card_lists.master;
                break;
            case "forecast":
                card_column = $scope.card_lists.forecast;
                break;
            default:
                card_column = $scope.card_lists.epochs[card_column_id];
        }
        $scope.editing_card = true;
        $scope.version_add_location = 'available_versions';
        $scope.edit_index = $scope.getCardIndex(card_column, card_color, card_name);
        $scope.card_being_edited = JSON.parse(JSON.stringify(card_column[$scope.edit_index]));
        $scope.edit_column = card_column;
    }
    $scope.editModifiers = function () {
        $scope.editing_modifiers = true;
        $scope.modifiers_being_edited = JSON.parse(JSON.stringify($scope.modifier_list));
    }
    $scope.finalizeModifierEdits = function () {
        $scope.editing_modifiers = false;
        $scope.modifier_list = $scope.modifiers_being_edited;
    }
    $scope.addModifierVersion = function (version_name) {
        $scope.modifiers_being_edited.push(version_name);
    }
    $scope.editInfectionRates = function () {
        $scope.editing_infection_rates = true;
        $scope.infection_rates_being_edited = JSON.parse(JSON.stringify($scope.infection_rates));
    }
    $scope.finalizeInfectionRateEdits = function () {
        $scope.editing_infection_rates = false;
        $scope.infection_rates = $scope.infection_rates_being_edited;
    }
    $scope.addInfectionRate = function () {
        $scope.infection_rates_being_edited.push('');
    }
    $scope.removeInfectionRate = function () {
        $scope.infection_rates_being_edited.splice($scope.infection_rates_being_edited.length - 1, 1);
    }
    $scope.addVersion = function (version_id) {
        $scope.card_being_edited[$scope.version_add_location][version_id] = $scope.card_being_edited[$scope.version_add_location][version_id] || 0;
        $scope.card_being_edited[$scope.version_add_location][version_id] += 1;
    }
    $scope.removeVersion = function (version_remove_location, version_id) {
        $scope.card_being_edited[version_remove_location][version_id] -= 1;
        if ($scope.card_being_edited[version_remove_location][version_id] == 0) {
            delete $scope.card_being_edited[version_remove_location][version_id];
        }
    }
    $scope.finalizeEdits = function () {
        $scope.edit_column[$scope.edit_index] = $scope.card_being_edited;
        $scope.editing_card = false;
    }
    $scope.cancelEdits = function () {
        $scope.editing_modifiers = false;
        $scope.editing_card = false;
        $scope.editing_infection_rates = false;
    }
    $scope.cardExists = function(column, card_color, card_name, version_set_id, version_id) {
        if (version_set_id) {
            if (column.find(function (card) {
                            if (version_set_id == 'drawn') {
                            return card.name == card_name && card.color == card_color && card.drawn_versions.hasOwnProperty(version_id);
                            } else {
                            return card.name == card_name && card.color == card_color && card.available_versions.hasOwnProperty(version_id);
                            }
                            })) {
                return true;
            }
        } else {
            if (column.find(function (card) {
                            return card.name == card_name && card.color == card_color;
                            })) {
                return true;
            }
        }
        return false;
    }
    $scope.getCard = function(column, card_color, card_name) {
        return column.find(function (card) {
                           return card.name == card_name && card.color == card_color;
                           })
    }
    $scope.getCardIndex = function(column, card_color, card_name) {
        return column.findIndex(function (card) {
                                return card.name == card_name && card.color == card_color;
                                })
    }
    $scope.availableFilter = function (card) {
        var count = 0;
        for (var version in card.available_versions) {
            count += card.available_versions[version];
        }
        return count > 0;
    }
    $scope.drawnFilter = function (card) {
        var count = 0;
        for (var version in card.drawn_versions) {
            count += card.drawn_versions[version];
        }
        return count > 0;
    }
    $scope.alert = function (alert_text) {
        alert(alert_text);
    }
    $scope.addCard = function (card_color, card_name) {
        if ($scope.cardExists($scope.card_lists.master, card_color, card_name)) {
            alert('A ' + card_color + ' card with the name ' + card_name + ' already exists. Please edit the card if you want a new version.')
        } else if (card_name == '') {
            alert('Please specify the name of the card you want to create.')
        } else {
            $scope.card_lists.master.push({'color': card_color, 'name': card_name, 'available_versions': {0: 1}, 'drawn_versions': {}})
        }
    }
    $scope.drawCard = function (card_column_id, card_color, card_name, card_version) {
        var card_column = null;
        switch (card_column_id) {
            case "master":
                card_column = $scope.card_lists.master;
                break;
            case "forecast":
                card_column = $scope.card_lists.forecast;
                break;
            default:
                card_column = $scope.card_lists.epochs[card_column_id];
        }
        var card_index = $scope.getCardIndex(card_column, card_color, card_name);
        $scope.drawCardByIndex(card_column_id, card_index, card_version);
    }
    $scope.drawCardByIndex = function (card_column_id, card_index, card_version) {
        var card_column = null;
        switch (card_column_id) {
            case "master":
                card_column = $scope.card_lists.master;
                break;
            case "forecast":
                card_column = $scope.card_lists.forecast;
                $scope.forecast_list_drawn = true;
                if (card_column.length == 1) {
                    $scope.stopForecasting();
                }
                break;
            default:
                card_column = $scope.card_lists.epochs[card_column_id];
        }
        var card = card_column[card_index];
        if (card_column_id == "forecast") {
            card_column.splice(card_index, 1);
        } else {
            card.available_versions[card_version] -= 1;
            card.drawn_versions[card_version] = card.drawn_versions[card_version] || 0;
            card.drawn_versions[card_version] += 1;
            if (card.available_versions[card_version] == 0) {
                delete card.available_versions[card_version];
            }
        }
            var draw_to_column = null;
            if ($scope.forecasting && card_column_id != 'forecast') {
                draw_to_column = $scope.card_lists.forecast;
            } else {
                draw_to_column = $scope.card_lists.epochs[$scope.current_epoch];
            }
            $scope.drawTo(draw_to_column, card.color, card.name, card_version)
    };
    $scope.undrawCard = function (card_column_id, card_color, card_name, card_version) {
        var card_column = null;
        switch (card_column_id) {
            case "master":
                card_column = $scope.card_lists.master;
                break;
            case "forecast":
                card_column = $scope.card_lists.forecast;
                break;
            default:
                card_column = $scope.card_lists.epochs[card_column_id];
        }
        var card_index = $scope.getCardIndex(card_column, card_color, card_name);
        $scope.undrawCardByIndex(card_column_id, card_index, card_version);
    }
    $scope.undrawCardByIndex = function (card_column_id, card_index, card_version) {
        var card_column = null;
        switch (card_column_id) {
            case "master":
                card_column = $scope.card_lists.master;
                break;
            case "forecast":
                card_column = $scope.card_lists.forecast;
                $scope.forecast_list_set = false;
                break;
            default:
                card_column = $scope.card_lists.epochs[card_column_id];
        }
        var card = card_column[card_index];
        if (card_column_id == "forecast") {
            card_column.splice(card_index, 1);
        } else {
            card.available_versions[card_version] -= 1;
            if (card.available_versions[card_version] == 0) {
                delete card.available_versions[card_version];
            }
        }
        var draw_to_column = null;
        if (card_column_id == "forecast") {
            for (var index = $scope.current_epoch; index >= 0; index--) {
                if ($scope.cardExists($scope.card_lists.epochs[index], card.color, card.name, 'drawn', card_version)) {
                    draw_to_column = $scope.card_lists.epochs[index];
                    break;
                }
            }
            if (draw_to_column == null) {
                draw_to_column = $scope.card_lists.master;
            }
        } else {
            for (var index = card_column_id - 1; index >= 0; index--) {
                if ($scope.cardExists($scope.card_lists.epochs[index], card.color, card.name, 'drawn', card_version)) {
                    draw_to_column = $scope.card_lists.epochs[index];
                    break;
                }
            }
            if (draw_to_column == null) {
                draw_to_column = $scope.card_lists.master;
            }
        }
        $scope.drawTo(draw_to_column, card.color, card.name, card_version, true)
    };
    $scope.drawTo = function (draw_to_column, card_color, card_name, card_version, undraw) {
        if (draw_to_column == $scope.card_lists.forecast) {
            card = {'color': card_color, 'name': card_name, 'available_versions': {}, 'drawn_versions': {}}
            card.available_versions[card_version] = 1;
            draw_to_column.push(card);
            if (draw_to_column.length == 8) {
                $scope.forecast_list_set = true;
            }
        } else {
            var card = null;
            if ($scope.cardExists(draw_to_column, card_color, card_name)) {
                card = $scope.getCard(draw_to_column, card_color, card_name);
            } else {
                card = {'color': card_color, 'name': card_name, 'available_versions': {}, 'drawn_versions': {}}
                draw_to_column.push(card);
            }
            card.available_versions[card_version] = card.available_versions[card_version] || 0;
            card.available_versions[card_version] += 1;
            if (undraw) {
                card.drawn_versions[card_version] -= 1;
                if (card.drawn_versions[card_version] == 0) {
                    delete card.drawn_versions[card_version];
                }
            }
        }
    };
}

pandemicInfectionTrackerApp.
controller('infectionController', ['$scope', infectionController]);

