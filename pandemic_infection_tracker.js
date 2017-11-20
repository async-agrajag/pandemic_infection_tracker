const city_cards_filename = 'city_cards.js';
const epoch_list = ['card_table_0','card_table_1','card_table_2','card_table_3','card_table_4','card_table_5','card_table_6','card_table_7'];
var current_epoch_name = epoch_list[city_cards.current_epoch];

function checkColor() {
    $('input[value="' + city_cards.selected_color +'"]').attr('checked', 'checked');
}

function newGame() {
    var confirmed = confirm('Are you sure you want to end the current game and start a new one?');
    if (confirmed) {
        newGameConfirmed();
    }
};

function newGameConfirmed() {
    //Iterate over cards in master list and re-enable them
    for (var index in city_cards.card_table_master) {
        var city_card = city_cards.card_table_master[index];
        city_cards.card_table_master[index] = Object.assign(city_card, {disabled: false});
    }
    city_cards.card_table_master = sortCityList(city_cards.card_table_master);

    
    //Set variables to base state
    city_cards.current_epoch = 0;
    city_cards.card_table_0 = [];
    city_cards.card_table_1 = [];
    city_cards.card_table_2 = [];
    city_cards.card_table_3 = [];
    city_cards.card_table_4 = [];
    city_cards.card_table_5 = [];
    city_cards.card_table_6 = [];
    city_cards.card_table_7 = [];
    city_cards.card_table_forecast = [];
    city_cards.forecasting = false;
    city_cards.forecast_list_set = false;
    
    drawScreen();
};

function startForecasting() {
    //Set up variables so we can scroll to keep the right side of the epidemic div in the same position
    var scroll_offset = $(document).width() / 4;
    var scroll_position = $('#epidemic_epochs').scrollLeft();
    
    //Set up variables
    city_cards.forecasting = true;
    city_cards.forecast_list_set = false;
    city_cards.forecast_count = 0;
    city_cards['card_table_forecast'] = [];
    
    drawScreen();
    
    //Scroll to keep right side of the epidemic div in the same position
    $('#epidemic_epochs').scrollLeft(scroll_offset + scroll_position);
}

function stopForecasting() {
    city_cards.forecasting = false;
    city_cards.forecast_list_set = false;
    //Remove all cards from forecasting list
    for (var index = city_cards.card_table_forecast.length - 1; index >= 0; index--) {
        removeCityFromForecast(index, true);
    }
    drawScreen();
}

function previousEpoch() {
    city_cards.current_epoch -= 1;
    current_epoch_name = epoch_list[city_cards.current_epoch];
    city_cards[current_epoch_name] = city_cards[current_epoch_name] || [];
    drawScreen();
};

function nextEpoch() {
    city_cards.current_epoch += 1;
    current_epoch_name = epoch_list[city_cards.current_epoch];
    city_cards[current_epoch_name] = city_cards[current_epoch_name] || [];
    drawScreen();
};

function saveText(text, filename){
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click();
};

function saveCities() {
    saveText('var city_cards = ' + JSON.stringify(city_cards) + ';', city_cards_filename);
};

function selectColor(color) {
    city_cards.selected_color = color;
};

function addCity(var_id, var_name, var_modifier) {
    if (var_name.length == 0) {
        window.alert('You must set the text in the below City Name text field.');
    } else {
        addCityConfirmed(var_id, var_name, var_modifier);
    }
}

function addCityConfirmed(var_id, var_name, var_modifier) {
    var next_seq_id = city_cards.seq_id += 1;
    city_cards[var_id] = city_cards[var_id] || [];
    city_cards[var_id].push({name: var_name, color: city_cards.selected_color, modifier: var_modifier, seq_id: next_seq_id, disabled: false});
    city_cards[var_id] = sortCityList(city_cards[var_id]);
    drawScreen();
};

function modifyCity(var_id, index, var_modifier) {
    current_modifier_length = city_cards[var_id][index].modifier.length;
    if (var_modifier.length == 0) {
        //New modifier is empty
        if (current_modifier_length > 0) {
            //Current modifier is not empty, this is a remove modifier call
            //We ask for confirmation before the change.
            var confirmed = confirm('Are you sure you want to remove the current modifier?');
            if (confirmed) {
                modifyCityConfirmed(var_id, index, var_modifier);
            }
        } else {
            //Current modifier is empty, we are trying to set nothing over nothing. Throw an alert that lets the user know how to modify the city properly.
            window.alert('You must set the text in the below Modifier text field.');
        }
    } else {
        //New modifier is not empty
        if (current_modifier_length > 0) {
            //Current modifier is not empty, this would be a replacement call
            //We ask for confirmation before the change.
            var confirmed = confirm('Are you sure you want to remove the current modifier and replace it with a new one?');
            if (confirmed) {
                modifyCityConfirmed(var_id, index, var_modifier);
            }
        } else {
            //Current modifier is empty, this is the basic add modifier functionality
            modifyCityConfirmed(var_id, index, var_modifier);
        }
    }
}

function modifyCityConfirmed(var_id, index, var_modifier) {
    city_cards[var_id][index] = Object.assign(city_cards[var_id][index], {modifier: var_modifier});
    city_cards[var_id] = sortCityList(city_cards[var_id]);
    drawScreen();
};

function removeCity(var_id, index) {
    //Get the seq_id from the city about to be removed, will be needed later
    var removed_city_seq_id = city_cards[var_id][index].seq_id;
    //Remove the city
    city_cards[var_id].splice(index, 1);
    //We need to re-enable city cards from other lists unless we are removing from the master list
    if (var_id != 'card_table_master') {
        //Set up variable to see if we need to check master list
        var enabled_city = false;
        //Iterate over epochs backwards from the one we are removing from to the first
        for (var i = var_id.substring(var_id.length - 1) - 1; i >= 0; i--) {
            //Get epoch name
            var earlier_epoch = epoch_list[i];
            //Get index of element in epoch, or -1 if it's not present
            var earlier_epoch_index = city_cards[earlier_epoch].findIndex(function(x) { return x.seq_id == removed_city_seq_id});
            //Enable the earlier card if present and stop looking for further entries
            if (earlier_epoch_index >= 0) {
                enableCity(earlier_epoch, earlier_epoch_index);
                enabled_city = true;
                break;
            }
        }
        if (!enabled_city) {
            //Get index of element in epoch, or -1 if it's not present
            var earlier_epoch_index = city_cards['card_table_master'].findIndex(function(x) { return x.seq_id == removed_city_seq_id});
            //Enable the earlier card if present
            if (earlier_epoch_index >= 0) {
                enableCity('card_table_master', earlier_epoch_index);
            }
        }
    }
    drawScreen();
};

function removeCityFromForecast(index, trigger_cleanup) {
    //Get the seq_id from the city about to be removed, will be needed later
    var removed_city_seq_id = city_cards['card_table_forecast'][index].seq_id;
    //Remove the city
    city_cards['card_table_forecast'].splice(index, 1);
    
    if (trigger_cleanup) {
        //Only cleanup master list and epidemics when needed
        
        //If we are cleaning up we haven't started drawing and need to possibly re-enable drawing to the forecast list
        city_cards.forecast_list_set = false;
        
        //Set up variable to see if we need to check master list
        var enabled_city = false;
        //Iterate over epochs backwards from current one to the first
        for (var i = city_cards.current_epoch; i >= 0; i--) {
            //Get epoch name
            var earlier_epoch = epoch_list[i];
            //Get index of element in epoch, or -1 if it's not present
            var earlier_epoch_index = city_cards[earlier_epoch].findIndex(function(x) { return x.seq_id == removed_city_seq_id});
            //Enable the earlier card if present and stop looking for further entries
            if (earlier_epoch_index >= 0) {
                enableCity(earlier_epoch, earlier_epoch_index);
                enabled_city = true;
                break;
            }
        }
        //If we haven't found a city to enable we need to check the master list
        if (!enabled_city) {
            //Get index of element in epoch, or -1 if it's not present
            var earlier_epoch_index = city_cards['card_table_master'].findIndex(function(x) { return x.seq_id == removed_city_seq_id });
            //Enable the earlier card if present
            if (earlier_epoch_index >= 0) {
                enableCity('card_table_master', earlier_epoch_index);
            }
        }
    }
    drawScreen();
};

function disableCity(var_id, index) {
    city_cards[var_id][index] = Object.assign(city_cards[var_id][index], {disabled: true});
    city_cards[var_id] = sortCityList(city_cards[var_id]);
    drawScreen();
};

function enableCity(var_id, index) {
    city_cards[var_id][index] = Object.assign(city_cards[var_id][index], {disabled: false});
    city_cards[var_id] = sortCityList(city_cards[var_id]);
    drawScreen();
};

function drawCity(var_id, index) {
    //Clone city card so modifications to a copy in one location don't affect all locations.
    var new_city_card = Object.assign({}, city_cards[var_id][index]);
    
    if (city_cards.forecasting) {
        //If we are forecasting draw rules change
        if (var_id == 'card_table_forecast') {
            //We are drawing from the forecast list to the active epidemic
            //Add card to current epidemic
            city_cards[current_epoch_name].push(new_city_card);
            //Remove the city from the forecast list without re-enabling where it came from
            removeCityFromForecast(index, false);
            //Check to see if the list is empty, and if it is stop forcasting.
            if (city_cards['card_table_forecast'].length == 0) {
                stopForecasting();
            }
        } else {
            //We are drawing from a prior epidemic, or the master list, to the forecast list
            //Add card to forecast list
            city_cards['card_table_forecast'].push(new_city_card)
            //Check to see if the list is full, and if it is set a variable to prevent further drawing to the forecast and allow drawing from the forecast
            if (city_cards['card_table_forecast'].length == 8) {
                city_cards.forecast_list_set = true;
            };
            //Disable the city in the list it's drawn from so that it doesn't get drawn again
            disableCity(var_id, index);
        }
    } else {
        //We are not forecasting, this is the basic functionality
        //Add card to current epidemic
        city_cards[current_epoch_name].push(new_city_card);
        //Disable the city in the list it's drawn from so that it doesn't get drawn again
        disableCity(var_id, index);
    };
    //Sort the city list for the current epoch
    city_cards[current_epoch_name] = sortCityList(city_cards[current_epoch_name]);
    
    drawScreen();
};

function moveCardUp(index) {
    city_cards['card_table_forecast'].splice(index - 1, 0, city_cards['card_table_forecast'].splice(index, 1)[0]);
    drawScreen();
};

function moveCardDown(index) {
    city_cards['card_table_forecast'].splice(index + 1, 0, city_cards['card_table_forecast'].splice(index, 1)[0]);
    drawScreen();
};

function sortCityList(city_list) {
    city_list.sort(compareCities);
    return city_list;
};

function tokenizeCityColor(color) {
    //Tokenize colors for sorting
    switch(color) {
        case 'Blue':
            return 0;
        case 'Yellow':
            return 1;
        case 'Black':
            return 2;
        case 'Red':
            return 3;
        default:
            return -1;
    };
}

function tokenizeBoolean(bool) {
    //Tokenize booleans for sorting
    if (bool) {
        return 1;
    } else {
        return 0;
    }
}

function compareCities(city_a, city_b) {
    //Determine relative position of cities based on the following order Active/Color(Blue, Yellow, Black, Red)/City Name/Modifier(Nulls Last)
    var city_a_disabled = tokenizeBoolean(city_a.disabled);
    var city_b_disabled = tokenizeBoolean(city_b.disabled);
    var city_a_color = tokenizeCityColor(city_a.color);
    var city_b_color = tokenizeCityColor(city_b.color);
    
    if (city_a_disabled < city_b_disabled) {
        return -1;
    } else if (city_a_disabled > city_b_disabled) {
        return 1;
    } else if (city_a_color < city_b_color) {
        return -1;
    } else if (city_a_color > city_b_color) {
        return 1;
    } else if (city_a.name < city_b.name) {
        return -1;
    } else if (city_a.name > city_b.name) {
        return 1;
    } else if (city_a.modifier == city_b.modifier) {
        return 0;
    } else if (city_a.modifier == '') {
        return 1;
    } else if (city_b.modifier == '') {
        return -1;
    } else if (city_a.modifier < city_b.modifier) {
        return -1;
    } else if (city_a.modifier > city_b.modifier) {
        return 1;
    }
    return 0;
};

function drawScreen() {
    //Determine epidemic list display width.
    var epoch_list_min_width = 3;
    if (city_cards.forecasting) {
        epoch_list_min_width = 2;
    }
    var epoch_list_width = city_cards.current_epoch + 1;
    if (epoch_list_width < epoch_list_min_width) {
        epoch_list_width = epoch_list_min_width;
    }
    
    //Set css classes for epidemic and epidemic list divs based on width;
    $('#epoch_list').attr('class', 'epoch_list width_' + epoch_list_width);
    for (var i = 0; i < 8; i++) {
        $('#epoch_card_list_'+i).attr('class', 'epoch_card_column one_part_of_' + epoch_list_width)
        if (i > city_cards.current_epoch) {
            $('#epoch_card_list_'+i).addClass('invisible');
        }
    }
    
    //Add display elements for master card list and forecast card list
    populateCityList('card_table_master');
    populateCityList('card_table_forecast');
    for (var index in epoch_list) {
        //Set identifier color based on active epoch
        if (index == city_cards.current_epoch) {
            $('#epoch_identifier_' + index).attr("class", "active_epoch_identifier");
        } else {
            $('#epoch_identifier_' + index).attr("class", "epoch_identifier");
        }
        
        //Add display elements to all epochs.
        var var_id = epoch_list[index];
        populateCityList(var_id);
    };
    
    //Enable/Disable forecast button and Unhide/Hide forecast div
    if (city_cards.forecasting) {
        $('#forecast_list').removeAttr('hidden');
        $('#forecast').attr('disabled', 'disabled');
        //Enable/Disable stop forecasting button
        if (city_cards.forecast_list_set && city_cards.card_table_forecast.length < 8) {
            $('#stop_forecast').attr('disabled', 'disabled');
        } else {
            $('#stop_forecast').removeAttr('disabled');
        }
    } else {
        $('#forecast_list').attr('hidden', 'hidden');
        $('#forecast').removeAttr('disabled');
    }
    
    //Enable/Disable previous and next button based on active epoch.
    if (city_cards.current_epoch == 0) {
        $('#previous').attr("disabled", "disabled");
        $('#next').removeAttr("disabled");
    } else if (city_cards.current_epoch == 7) {
        $('#previous').removeAttr("disabled");
        $('#next').attr("disabled", "disabled");
    } else {
        $('#previous').removeAttr("disabled");
        $('#next').removeAttr("disabled");
    }
};

function createButtonAndAttachToElement(parent_element, text, css_class, js_function, disabled) {
    //Set up button
    var new_button = document.createElement('button');
    //Add JS function call
    new_button.setAttribute('onclick', js_function);
    //Add CSS class
    new_button.setAttribute('class', css_class);
    //Disable if needed
    if (disabled) {
        new_button.setAttribute('disabled', 'disabled');
    };
    //Add text
    new_button.innerHTML = text;
    //Add to parent element
    parent_element.appendChild(new_button);
}

function createTableTextCellAndAttachToElement(parent_element, text, css_class) {
    //Set up table cell for holding text
    var new_text_cell = document.createElement('td');
    //Add CSS class
    new_text_cell.setAttribute("class", css_class);
    //Create text node with the given text
    var text_node = document.createTextNode(text);
    //Add the text node to the cell
    new_text_cell.appendChild(text_node);
    //Add the cell to the parent element
    parent_element.appendChild(new_text_cell);
}

function populateCityList(var_id) {
    //Set up the replacement table body
    var new_tbody = document.createElement('tbody');
    new_tbody.setAttribute("id", var_id);
    
    //Check to see if this is the current epoch, will be used later
    if (var_id.substring(var_id.length - 1) == city_cards.current_epoch) {
        var in_current_epoch = true;
    } else {
        var in_current_epoch = false;
    };
    
    //Be sure that the attribute exists in the city_cards object
    if (city_cards.hasOwnProperty(var_id)) {
        //Iterate over all cards in list
        for (var i = 0; i < city_cards[var_id].length; i++) {
            //Set up variable button function texts
            var enable_city_function = "enableCity('" + var_id + "', " + i + ");";
            var disable_city_function = "disableCity('" + var_id + "', " + i + ");";
            var draw_city_function = "drawCity('" + var_id + "', " + i + ");";
            var remove_city_function = "removeCity('" + var_id + "', " + i + ");";
            var remove_city_from_forecast_function = "removeCityFromForecast(" + i + ", true);";
            var add_modifier_function = "modifyCity('" + var_id + "', " + i + ", document.getElementById('modifier').value);";
            var move_card_up_function = "moveCardUp(" + i + ")";
            var move_card_down_function = "moveCardDown(" + i + ")";
            
            //Get city data
            var city = city_cards[var_id][i];
            
            //Create row
            var new_row = document.createElement('tr');
            //Set class based on disabled status
            if (city.disabled) {
                new_row.setAttribute("class", "disabled_city_card");
            } else {
                new_row.setAttribute("class", "city_card");
            }
            //Add to table body
            new_tbody.appendChild(new_row);
            
            //Create text cells
            createTableTextCellAndAttachToElement(new_row, city.name, "card_name_" + city.color.toLowerCase());
            createTableTextCellAndAttachToElement(new_row, city.modifier, "card_modifier");
            
            //Create cell for buttons
            var new_button_cell = document.createElement('td');
            new_button_cell.setAttribute("class", "card_buttons");
            new_row.appendChild(new_button_cell);
            
            //Set up variables for Draw button
            var draw_button_disabled = false;
            if (city.disabled || var_id == current_epoch_name || (var_id == 'card_table_forecast' && !city_cards.forecast_list_set)) {
                draw_button_disabled = true;
            } else if (city_cards.forecasting && city_cards.forecast_list_set && (var_id != 'card_table_forecast' || i != 0)) {
                draw_button_disabled = true;
            }
            var create_draw_button = true;
        
            //Set up variables for Disable button
            var create_disable_button = false;
            if (var_id != 'card_table_forecast') {
                if (city.disabled) {
                    var disable_button_function = enable_city_function;
                    var disable_text_string = 'Enable City';
                } else {
                    var disable_button_function = disable_city_function;
                    var disable_text_string = 'Disable City';
                }
                create_disable_button = true;
            }
            
            //Set up variables for Remove button
            var remove_button_disabled = false;
            if (city.disabled || (var_id == 'card_table_forecast' && city_cards.forecast_list_set && city_cards.forecast_count < 8)) {
                remove_button_disabled = true;
            }
            if (var_id == 'card_table_forecast') {
                var remove_function = remove_city_from_forecast_function;
            } else {
                var remove_function = remove_city_function;
            }
            var create_remove_button = true;
            
            //Set up variables for Modify button
            if (var_id == 'card_table_master') {
                if (city.disabled) {
                    var modify_button_disabled = true;
                } else {
                    var modify_button_disabled = false;
                }
                if (city.modifier == '') {
                    var modifier_text_string = 'Add Modifier';
                } else {
                    if (document.getElementById('modifier').value.length == 0) {
                        var modifier_text_string = 'Remove Modifier';
                    } else {
                        var modifier_text_string = 'Change Modifier';
                    }
                    if (document.getElementById('modifier').value == city.modifier) {
                        modify_button_disabled = true;
                    }
                }
                var create_modify_button = true;
            } else {
                var create_modify_button = false;
            }
            
            //Add all buttons
            if (create_draw_button) {
                //Add Draw button
                createButtonAndAttachToElement(new_button_cell, 'Draw City', 'card_button', draw_city_function, draw_button_disabled)
            }
            if (create_disable_button) {
                //Add Disable button
                createButtonAndAttachToElement(new_button_cell, disable_text_string, 'card_button', disable_button_function, false)
            }
            if (create_remove_button) {
                //Add Remove button
                createButtonAndAttachToElement(new_button_cell, 'Remove City', 'card_button', remove_function, remove_button_disabled)
            }
            if (create_modify_button) {
                //Add Modify button
                createButtonAndAttachToElement(new_button_cell, modifier_text_string, 'card_button', add_modifier_function, modify_button_disabled)
            }
            if (var_id == 'card_table_forecast') {
                var new_button_cell = document.createElement('td');
                new_button_cell.setAttribute("class", "position_buttons");
                new_row.appendChild(new_button_cell);
                if (i == 0) {
                    var up_button_disabled = true;
                } else {
                    var up_button_disabled = false;
                }
                if (i == (city_cards[var_id].length - 1)) {
                    var down_button_disabled = true;
                } else {
                    var down_button_disabled = false;
                }
                createButtonAndAttachToElement(new_button_cell, '&uarr;', 'position_button', move_card_up_function, up_button_disabled);
                createButtonAndAttachToElement(new_button_cell, '&darr;', 'position_button', move_card_down_function, down_button_disabled);
            }
        }
    }
    $("#"+var_id).replaceWith(new_tbody);
};
