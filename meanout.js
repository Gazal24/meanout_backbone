var obj = obj || {};

var l = function(msg){
    console.log(msg);
};


//Load dust templates.
(function(){
    dust.loadSource(dust.compile($("#tile-template").html(), 'tile'));
})($);


// Tile Model
(function() {
    
    obj.Tile = Backbone.Model.extend({
	initialize: function() {
	    console.log("initializing tile");
	},

	defaults: {
	    id: 0,
	    value: 0,
	    selected: false
	},
    });
})($);


// Slot Model
(function() {
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
	    'click .tile-view' : 'tile_clicked'
	},

	initialize: function(){
	    _.bindAll(this, "render");
	    this.model.bind('change', this.render);
	},

	render: function(){
	    // var self= this;

	    // dust.render('tile', this.model.attributes, function(err, out){
	    //   return self.$(out);
	    // });
	    //	    $(this.el).html("<span class='tile-view' style='background:BLACK'>" + this.model.get('value') + "</span>");

	    $(this.el).addClass('col-xs-4 tile');
	    
	    if(this.model.get('selected'))
	    	$(this.el).addClass('selected').removeClass('unselected');
	    else 
	    	$(this.el).addClass('unselected');

	    $(this.el).html("<span class='tile-view'>" + this.model.get('value') + "</span>");
	    
	    return this;
	},
	
	tile_clicked: function(){
	    console.log(this.model.get('value'));

	    // Toggle the selected state of a tile.
	    this.model.set({
		selected: !this.model.get('selected')
	    });
	    
	    // If the tile got selected then add it to Slots Collection
	    // else remove it from slots collection and let callbacks
	    // handle rest of the logic.
	    if(this.model.get('selected'))
		obj.slots.add(this.model);
	    else obj.slots.remove(this.model);
	}
    });
})($);


//BoardView
(function(){
    obj.BoardView = Backbone.View.extend({
	
	el: $("#arena"),

	initialize: function(){
	    _.bindAll(this, 'appendTile');

	    obj.board = new obj.Board();
	    obj.board.bind('add', this.appendTile);

	    obj.slots = new obj.Slots();
	    obj.slots.bind('add', this.tileSelected);
	    obj.slots.bind('remove', this.tileRemoved);

	    for(x=0; x<9; x++) {
		var tile = new obj.Tile();
		tile.set({
		    id: x,
		    value: Math.floor(Math.random()* 20 +1)
		});
		obj.board.add(tile);
	    }
	},
	
	// Called each time a new Tile(model) is added to Board(collection)
	appendTile: function(model) {
	    var tileview = new obj.TileView({model: model});
	    //	    tileview.render();
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
		    console.log("// AVERAGE OUT");
		    obj.slots.models[0].set({value: mean});
		    obj.slots.models[1].set({value: mean});
		}
		obj.slots.remove(obj.slots.models[0]);
		obj.slots.remove(obj.slots.models[0]);
	    }
	    else {
		console.log("wait for one more tile");
		$("#info").html("One Selected.");	    
	    }
	},

	tileRemoved: function(model){
	    console.log("Tile is removed");
	    console.log(obj.slots);
	    model.set({selected: false});
	}

	
    });

    obj.board =  new obj.BoardView();

})($);


// // Info Panel View
// (function(){

//     obj.InfoView = Backbone.View.extend({
// 	initialize: function(){
// 	    _bindAll: (this, render);

// 	},

// 	render: function(){

// 	}

//     })

// })($);
