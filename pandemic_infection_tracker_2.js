const color_codes = ['blue', 'yellow', 'black', 'red']

function epochList(hierarchy) {
    this.hierarchy = hierarchy;
    this.epochs = [new cardColumn(`${this.hierarchy}.epochs`, "card_list_epoch_0", "Pre-Epidemic\nInfection Rate: 2", "epoch_card_list", "card_column_epoch")];
    this.current_epoch = 0;
    this.addEpoch = function () {
        var epoch_count = this.epochs.length + 1;
        var new_epoch = new cardColumn(`${this.hierarchy}.epochs[${epoch_count}]`, `card_list_epoch_${epoch_count}`, `Epidemic ${epoch_count}\nInfection Rate: ${infection_rates[epoch_count]}`, "card_column_epoch");
        this.epochs.push(new_epoch);
    };
    this.setCardHierarchies = function () {
        for (var index in this.epochs) {
            this.epochs[index].setCardHierarchies();
        }
    };
    this.blit = function () {
        var modifier_key = $('#modifier_key');
        
        var new_div = document.createElement('div');
        new_div.setAttribute("id", 'epoch_master');
        new_div.setAttribute("class", 'epoch_master');
        $('#epoch_master').replaceWith(new_div);
        var epoch_list = $("<div>", {"id": 'epoch_list', "class": 'epoch_list'});
        $('#epoch_master').append(epoch_list);
        for (var index in this.epochs) {
            var epoch_column = $("<div>", {"id": `card_list_epoch_${index}`, "class": 'card_column_epoch'});
            epoch_list.append(epoch_column);
            
            if (index == this.current_epoch) {
                this.epochs[index].blit(true);
            } else {
                this.epochs[index].blit(false);
            }
        }
        
        $('#epoch_master').append(modifier_key);
    };
    this.previousEpoch = function () {
        
    };
    this.nextEpoch = function () {
        
    };
}
class cardColumn {
    constructor(hierarchy, column_id, list_identifier_text, list_css_class, column_css_class) {
        this.hierarchy = hierarchy;
        this.column_id = column_id;
        this.column_css_class = column_css_class || column_id;
        this.list_identifier = new listIdentifier(`${this.hierarchy}.list_identifier`, column_id, list_identifier_text);
        this.list = new cardList(`${this.hierarchy}.list`, column_id, list_css_class);
        this.blit = function (active) {
            var new_div = document.createElement('div');
            new_div.setAttribute("id", this.column_id);
            new_div.setAttribute("class", this.column_css_class);
            $(`#${this.column_id}`).replaceWith(new_div);
            this.list_identifier.blit(active);
            this.list.blit();
        };
        this.addCard = function (card) {
            this.list.addCard(card);
            this.blit();
        };
        this.setCardHierarchies = function () {
            this.list.setCardHierarchies();
        };
    }
}
class masterCardColumn extends cardColumn {
    constructor(hierarchy) {
        super(hierarchy, "card_column_master", "Full Deck", "card_list_master");
        this.selected_color = 0;
        this.reset = function () {
            
        };
        this.blit = function () {
            var control_div = $('#control');
            var new_div = document.createElement('div');
            new_div.setAttribute("id", this.column_id);
            new_div.setAttribute("class", this.column_id);
            $(`#${this.column_id}`).replaceWith(new_div);
            this.list_identifier.blit();
            this.list.blit()
            $(`#${this.column_id}`).append(control_div);
        };
        this.selectColor = function (color) {
            this.selected_color = color;
        };
        this.addCard = function (city_name) {
            if (city_name.length == 0) {
                window.alert('You must set the text in the below City Name text field.');
            } else if (this.list.getIndex(city_name) >= 0) {
                window.alert('You are trying to add an existing city. If more copies of this city are required, add those copies through the edit menu on the existing card.');
            } else {
                this.list.addCard(new cityCard(city_name, this.selected_color));
            }
            this.list.setCardHierarchies();
            this.blit();
        };
    }
}
class forecastCardColumn extends cardColumn {
    constructor(hierarchy) {
        super(hierarchy, "card_column_forecast", "Forecast Deck", "card_list_forecast");
        this.forecasting = false;
        this.forecast_list_set = false;
        this.blit = function () {
            var stop_forecast_div = $('#stop_forecast_button_container');
            var new_div = document.createElement('div');
            new_div.setAttribute("id", this.column_id);
            if (this.forecasting) {
                new_div.setAttribute("class", this.column_id);
            } else {
                new_div.setAttribute("class", `${this.column_id} invisible`);
            }
            $(`#${this.column_id}`).replaceWith(new_div);
            this.list_identifier.blit();
            this.list.blit();
            $(`#${this.column_id}`).append(stop_forecast_div);
        };
        this.startForecasting = function () {
            this.forecasting = true;
            this.blit();
        };
        this.stopForecasting = function () {
            this.forecasting = false;
            this.blit();
        };
        this.addCard = function (card) {
            this.list.addCard(card);
            this.blit();
        };
    }
}
class listIdentifier {
    constructor(hierarchy, column_id, list_identifier_text) {
        this.hierarchy = hierarchy;
        this.column_id = column_id;
        this.list_identifier_text = list_identifier_text;
        this.blit = function (active) {
            var lines_in_text = this.list_identifier_text.split("\n").length;
            var identifier_css_class = '';
            if (active) {
                identifier_css_class = `epoch_identifier identifier_text_${lines_in_text}_line active`;
            } else {
                identifier_css_class = `epoch_identifier identifier_text_${lines_in_text}_line`;
            }
            var text = this.list_identifier_text;
            var list_div = $("<div>", {"class": identifier_css_class, "text": text});
            $(`#${this.column_id}`).append(list_div);
        };
    }
}
class cardList {
    constructor(hierarchy, column_id, list_css_class) {
        this.hierarchy = hierarchy;
        this.column_id = column_id;
        this.list_css_class = list_css_class;
        this.cards = [];
        this.getIndex = function (card_name) {
            return this.cards.findIndex(function(card) {
                                        return card.name == card_name;
                                        });
        };
        this.getCard = function (card_name) {
            var index = this.getIndex(card_name);
            return this.cards[index];
        };
        this.removeCard = function (card_name) {
            var index = this.getIndex(card_name);
            this.cards.splice(index, 1);
        };
        this.addCard = function (card) {
            this.cards.push(card);
        };
        this.setCardHierarchies = function () {
            for (var index in this.cards) {
                this.cards[index].setHierarchy(`${this.hierarchy}.cards[${index}]`);
            }
        }
        this.sortedCardsForColor = function (color_code) {
            var cards_for_color = this.cards.filter(card => card.color == color_code);
            return cards_for_color.sort(function(a,b) {
                                        if (a.name < b.name) {
                                            return -1
                                        } else if (b.name < a.name) {
                                            return 1
                                        } else {
                                            return 0
                                        }
                                        })
        };
        this.blitCardVersions = function(list_div, card_name, card_css_class, version_array) {
            var card_div = $("<div>", {"class": card_css_class});
            var text_div = $("<div>", {"class": 'card_text', "text": card_name});
            var edit_div = $("<div>", {"class": 'edit_card'});
            var edit_anchor = $("<a>", {"text": 'edit'});
            var version_counts_div = $("<div>", {"class": 'card_version_counts'});
            var index = 0;
            for (var property in version_array) {
                if (version_array.hasOwnProperty(property)) {
                    var count = version_array[property];
                    var version_div = $("<div>", {"class": `card_version_${index}`});
                    var version_draw_button_div = $("<div>", {"class": 'version_draw_button'});
                    var version_draw_button = $("<button>", {"class": 'full_size_button', "text": property});
                    var version_count_div = $("<div>", {"class": 'version_count'});
                    version_counts_div.append(version_div);
                    version_div.append(version_draw_button_div);
                    version_draw_button_div.append(version_draw_button);
                    version_div.append(version_count_div);
                    version_count_div.append(`&nbsp;x${count}`);
                }
                index += 1;
            }
            list_div.append(card_div);
            card_div.append(text_div);
            card_div.append(edit_div);
            edit_div.append(edit_anchor);
            card_div.append(version_counts_div);
        }
        this.blit = function () {
            var list_div = $("<div>", {"class": this.list_css_class});
            $(`#${this.column_id}`).append(list_div);
            
            var blue_cards = this.sortedCardsForColor(0);
            var yellow_cards = this.sortedCardsForColor(1);
            var black_cards = this.sortedCardsForColor(2);
            var red_cards = this.sortedCardsForColor(3);
            var all_cards = [blue_cards, yellow_cards, black_cards, red_cards];
            
            for (var color_index in all_cards) {
                for (var index in all_cards[color_index]) {
                    var card = all_cards[color_index][index];
                    if (Object.keys(card.enabled).length > 0) {
                        var card_css_class = `city_card ${color_codes[card.color]}`
                        this.blitCardVersions(list_div, card.name, card_css_class, card.enabled);
                    }
                }
            }
            for (var color_index in all_cards) {
                for (var index in all_cards[color_index]) {
                    var card = all_cards[color_index][index];
                    if (Object.keys(card.disabled).length > 0) {
                        var card_css_class = `city_card ${color_codes[card.color]} drawn`
                        this.blitCardVersions(list_div, card.name, card_css_class, card.disabled);
                    }
                }
            }
        };
    }
}
class cityCard {
    constructor(name, color) {
        this.hierarchy = '';
        this.name = name;
        this.color = color;
        this.enabled = {
            0: 1
        };
        this.disabled = {
        };
        this.setHierarchy = function (hierarchy) {
            this.hierarchy = hierarchy;
        };
        this.drawCity = function (version) {
            this.enabled[version] -= 1;
            this.disabled[version] = this.disabled[version] || 0;
            this.disabled[version] += 1;
            if (infection_tracker.forecast_list.forecasting) {
                infection_tracker.forecast_list.drawTo(this, version);
            } else {
                infection_tracker.epochList.drawTo(this, version);
            }
        };
    }
}

const infection_tracker = {
    master_list: new masterCardColumn('infection_tracker.master_list'),
    epoch_lists: new epochList('infection_tracker.epoch_lists'),
    forecast_list: new forecastCardColumn('infection_tracker.forecast_list'),
    modifier_list: ['None'],
    infection_rates: [2,2,2,3,3,4,4,5]
};


var saved = true;

function prepPageElements() {
    document.getElementById('upload').onchange = function() {
        var files = document.getElementById('upload').files;
        if (files.length <= 0) {
            return false;
        }
        
        var fr = new FileReader();
        
        fr.onload = function(e) {
            var confirmed = false;
            if (saved) {
                confirmed = true;
            } else {
                confirmed = confirm('Are you sure you want to end the current game and start a new one?');
            }
            if (confirmed) {
                var new_infection_tracker = JSON.parse(e.target.result);
                
                infection_tracker.master_list = Object.assign(new masterCardColumn, new_infection_tracker.master_list);
                infection_tracker.master_list.list_identifier = Object.assign(new listIdentifier, new_infection_tracker.master_list.list_identifier);
                infection_tracker.master_list.list = Object.assign(new cardList, new_infection_tracker.master_list.list);
                for (var card_index in infection_tracker.master_list.list.cards) {
                    var card = infection_tracker.master_list.list.cards[card_index];
                    
                    infection_tracker.master_list.list.cards[index] = Object.assign(new cityCard, card);
                }
                
                infection_tracker.epoch_lists = Object.assign(new epochList, new_infection_tracker.epoch_lists);
                for (var index in infection_tracker.epoch_lists.epochs) {
                    var epoch_list = infection_tracker.epoch_lists.epochs[index];
                    
                    infection_tracker.epoch_lists.epochs[index] = Object.assign(new cardColumn, epoch_list);
                    infection_tracker.epoch_lists.epochs[index].list_identifier = Object.assign(new listIdentifier, epoch_list.list_identifier);
                    infection_tracker.epoch_lists.epochs[index].list = Object.assign(new cardList, epoch_list.list);
                    for (var card_index in epoch_list.cards) {
                        var card = epoch_list.cards[card_index];
                        
                        epoch_list.cards[index] = Object.assign(new cityCard, card);
                    }
                }
                
                infection_tracker.forecast_list = Object.assign(new forecastCardColumn, new_infection_tracker.forecast_list);
                infection_tracker.forecast_list.list_identifier = Object.assign(new listIdentifier, new_infection_tracker.forecast_list.list_identifier);
                infection_tracker.forecast_list.list = Object.assign(new cardList, new_infection_tracker.forecast_list.list);
                for (var card_index in infection_tracker.forecast_list.list.cards) {
                    var card = infection_tracker.forecast_list.list.cards[card_index];
                    
                    infection_tracker.forecast_list.list.cards[index] = Object.assign(new cityCard, card);
                }
                
                
                infection_tracker.modifier_list = new_infection_tracker.modifier_list;
                infection_tracker.infection_rates = new_infection_tracker.infection_rates;
                
                $('input[value="' + infection_tracker.master_list.selected_color +'"]').prop('checked', true);
                
                infection_tracker.master_list.blit();
                infection_tracker.forecast_list.blit();
                infection_tracker.epoch_lists.blit();
            }
        }
        
        fr.readAsText(files.item(0));
        
        document.getElementById('upload').value = '';
    };
    
    infection_tracker.master_list.blit();
    infection_tracker.forecast_list.blit();
    infection_tracker.epoch_lists.blit();
};

function newGame() {
    var confirmed = confirm('Are you sure you want to end the current game and start a new one?');
    if (confirmed) {
        newGameConfirmed();
    }
};

function newGameConfirmed() {
    infection_tracker.master_list.reset();

    infection_tracker.epoch_lists = new epochList('infection_tracker.epoch_lists');
    infection_tracker.forecast_list = new forecastCardColumn('infection_tracker.forecast_list');
};

function startForecasting() {
    infection_tracker.forecast_list.startForecasting();
}

function stopForecasting() {
    infection_tracker.forecast_list.stopForecasting();
}

function previousEpoch() {
    infection_tracker.epochs.previousEpoch();
    saved = false;
};

function nextEpoch() {
    infection_tracker.epochs.nextEpoch();
    saved = false;
};

function saveText(text, filename){
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click();
};

function saveData() {
    saveText(JSON.stringify(infection_tracker), 'pandemic_infection_tracker.json');
    saved = true;
};

function selectColor(color) {
    infection_tracker.master_list.selectColor(color);
    saved = false;
};

function addCity(city_name) {
    infection_tracker.master_list.addCard(city_name);
    saved = false;
};
