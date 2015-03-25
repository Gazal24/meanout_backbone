var obj = obj || {};

var l = function(msg){
    console.log(msg);
};

//Load dust templates.
(function(){
    dust.loadSource(dust.compile($("#tile-template").html(), 'tile'));
})($);


// Info Model & View
(function(){
    obj.Info = Backbone.Model.extend({
	defaults: {
	    text: ""
	}
    })

    //TODO : Add InfoView
})($);


// Tile Model
(function(){
    obj.Tile = Backbone.Model.extend({
	defaults: {
	    id: 0,
	    value: 0,
	    selected: false
	},
    });
})($);


// Slot Collection
(function(){
    obj.Slots = Backbone.Collection.extend({
	model: obj.Tile
    });
})($);


// Board Collection
(function(){
    obj.Board = Backbone.Collection.extend({
	model: obj.Tile
    });
})($);


//Tile View
(function(){
    obj.TileView = Backbone.View.extend({
	events: {
	    'click' : 'tile_clicked',
	},

	awesome: function(){
	    console.log('awesome');
	},
	
	initialize: function(){
	    _.bindAll(this, 'render', 'renderValue', 'renderAppearance');
	    this.model.bind('change:value', this.renderValue);
	    this.model.bind('change:selected', this.renderAppearance);
	},

	renderValue: function(){
	    console.log('rendering Value');
	    $('.tile-view', this.el).html(this.model.get('value'));
	},

	renderAppearance: function(){
	    console.log('rendering tile appearance');
	    if(this.model.get('selected'))
		$(this.el).addClass('selected').removeClass('unselected');
	    else
		$(this.el).addClass('unselected').removeClass('selected');
	},
	
	render: function(){
	    // var self= this;

	    // dust.render('tile', this.model.attributes, function(err, out){
	    //   return self.$(out);
	    // });
	    //	    $(this.el).html("<span class='tile-view' style='background:BLACK'>" + this.model.get('value') + "</span>");

	    // Initializing the ugly way until Dust.js is integrated.
	    $(this.el).addClass('col-xs-4 tile').html("<span class='tile-view'></span>");
	    
	    this.renderAppearance();
	    this.renderValue();
	    
	    return this;
	},
	
	tile_clicked: function(){
	    // Toggle the selected state of a tile.
	    this.model.set({
		selected: !this.model.get('selected')
	    });
	    
	    // If the tile got selected then add it to Slots Collection
	    // else remove it from slots collection and let callbacks
	    // handle rest of the logic.
	    if (this.model.get('selected'))
		obj.slots.add(this.model);
	    else
		obj.slots.remove(this.model);
	}
    });
})($);


//Sum Model & View
(function(){
    obj.Sum = Backbone.Model.extend({
	defaults: {
	    sumValue: 0
	}
    }),
    
    obj.SumView = Backbone.View.extend({
	
	el: $('#sum'),
	
	initialize: function(){
	    _.bindAll(this, 'render');
	    this.model.bind('change', this.render);
	    this.render();
	},
	
	render: function(){
	    $('span', this.el).html(this.model.get('sumValue'));
	}
    })
})($);


//BoardView
(function(){
    obj.BoardView = Backbone.View.extend({
	
	el: $("#arena"),

	initialize: function(){
	    _.bindAll(this, 'appendTile');

	    // Initialize Board
	    obj.board = new obj.Board();
	    obj.board.bind('add', this.appendTile);

	    // Initialize Slots
	    obj.slots = new obj.Slots();
	    obj.slots.bind('add', this.tileSelected);
	    obj.slots.bind('remove', this.tileUnselected);

	    // Initialize all Tiles
	    for(x=0; x<9; x++) {
		var tile = new obj.Tile();
		tile.set({
		    id: x,
		    value: Math.floor(Math.random()* 20 +1)
		});
		obj.board.add(tile);
	    }

	    // INITIALIZE SUM
	    obj.sum = new obj.Sum();
	    var total = 0;
	    _.each(obj.board.models, function(tile){total+=tile.get('value')});
	    obj.sum.set({sumValue: total});
	    new obj.SumView({model: obj.sum});
	},
	
	// Called each time a new Tile(model) is added to Board(collection)
	appendTile: function(tile) {
	    var tileview = new obj.TileView({model: tile});
	    $("#arena").append(tileview.render().el);

	},

	// Called each time a new Tile(model) is selected and added to Slots(collection)
	tileSelected: function(model){
	    if(obj.slots.length == 2) {
		var mean = (obj.slots.models[0].get('value') + obj.slots.models[1].get('value')) / 2;
		if(mean%1!=0) {
		    $("#info").html("Only Integer allowed.");
		} else {
		    $("#info").html("Mean Out.");
		    setTimeout(function(){$("#info").html("Continue...")}, 1000);
		    console.log("Average Out");
		    obj.slots.models[0].set({value: mean});
		    obj.slots.models[1].set({value: mean});
		}
		obj.slots.pop(); // Remove First Tile
		obj.slots.pop(); // Remove Second Tile
	    }
	    else {
		console.log("Wait for one more tile");
		$("#info").html("One Selected.");
	    }
	},

	// Called each time a previously selected Tile(model) is unselected and removed from Slots(collection)
	tileUnselected: function(model){
	    console.log("Tile removed");
	    model.set({selected: false});
	}
    });

    obj.boardView =  new obj.BoardView();

})($);
