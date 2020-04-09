
var cards = (function() {
	//The global options
	var opt = {
		cardSize : {width:69,height:94, padding:18},
		animationSpeed : 500,
		table : 'body',
		cardback : 'red',
		acesHigh : false,
		cardsUrl : 'img/cards.png',
		blackJoker : false,
		redJoker : false,
		shortDeck: true
	};
	var zIndexCounter = 1;
	var all = []; //All the cards created.
	
	function mouseEvent(ev) {
		var card = $(this).data('card');
		if (card.container) {
			var handler = card.container._click;
			if (handler) {
				handler.func.call(handler.context||window, card, ev);
			}
		}
	}
	
	function init(options) {
		if (options) {
			for (var i in options) {
				if (opt.hasOwnProperty(i)) {
					opt[i] = options[i];
				}
			}
		}
		var start = opt.shortDeck ? 7 : opt.acesHigh ? 2 : 1;
		var end = start + (opt.shortDeck ? 7 : 12);
		opt.table = $(opt.table)[0];
		if ($(opt.table).css('position') == 'static') {
			$(opt.table).css('position', 'relative');
		}
		for (var i = start; i <= end; i++) {
			all.push(new Card('h', i, opt.table));
			all.push(new Card('s', i, opt.table));
			all.push(new Card('d', i, opt.table));
			all.push(new Card('c', i, opt.table));
		}
		if (opt.blackJoker) {
			all.push(new Card('bj', 0, opt.table));
		}
		if (opt.redJoker) {
			all.push(new Card('rj', 0, opt.table));
		}
		
		$('.card').click(mouseEvent);
		shuffle(all);
	}

    function shuffle(deck) {
        //Fisher yates shuffle
        var i = deck.length;
        if (i == 0) return;
        while (--i) {
            var j = Math.floor(Math.random() * (i + 1));
            var tempi = deck[i];
            var tempj = deck[j];
            deck[i] = tempj;
            deck[j] = tempi;
        }
    }
	
	function suit2num(rank) {
		if(rank=='s') return 0;
		if(rank=='d') return 1;
		if(rank=='h') return 2;
		return 3;
	}

	function num2suit(rank) {
		if(rank==0) return 's';
		if(rank==1) return 'd';
		if(rank==2) return 'h';
		return 'c';
	}

	function copy(deck) {
		var res = [];
		for(var i=0; i<deck.length; i++) {
			res.push(deck[i].toNum());
		}
		return res;
	}

	function Card(suit, rank, table) {
		this.init(suit, rank, table);
	}
	
	Card.prototype = {
		init: function (suit, rank, table) {
			this.shortName = suit + rank;
			this.suit = suit;
			this.rank = rank;
			this.name = suit.toUpperCase()+rank;
			this.faceUp = false;
			this.el = $('<div/>').css({
				width:opt.cardSize.width,
				height:opt.cardSize.height,
				"background-image":'url('+ opt.cardsUrl + ')',
				position:'absolute',
				cursor:'pointer'	
			}).addClass('card').data('card', this).appendTo($(table));
			this.showCard();
			this.moveToFront();
		},

		toString: function () {
			return this.name;
		},

		toNum: function () {
			return (suit2num(this.suit)*8)+(this.rank-7);
		},

		moveTo : function(x, y, speed, callback) {
			var props = {top:y-(opt.cardSize.height/2),left:x-(opt.cardSize.width/2)};
			$(this.el).animate(props, speed || opt.animationSpeed, callback);
		},
		
		rotate : function(angle) {
			$(this.el)
				.css('-webkit-transform', 'rotate(' + angle + 'deg)')
				.css('-moz-transform', 'rotate(' + angle + 'deg)')
				.css('-ms-transform', 'rotate(' + angle + 'deg)')
				.css('transform', 'rotate(' + angle + 'deg)')
				.css('-o-transform', 'rotate(' + angle + 'deg)');
		},
		
		showCard : function() {
			var offsets = { "c": 0, "d": 1, "h": 2, "s": 3, "rj": 2, "bj": 3 };
			var xpos, ypos;
			var rank = this.rank;
			if (rank == 14) {
				rank = 1; //Aces high must work as well.
			}
			xpos = -rank * opt.cardSize.width;
			ypos = -offsets[this.suit] * opt.cardSize.height;
			this.rotate(0);
			$(this.el).css('background-position', xpos + 'px ' + ypos + 'px');
		},

		hideCard : function(position) {
			var y = opt.cardback == 'red' ? 0*opt.cardSize.height : -1*opt.cardSize.height;
			$(this.el).css('background-position', '0px ' + y + 'px');
			this.rotate(0);
		},
		
		bounce : function() {
			var speed = opt.animationSpeed;
			var el = this.el;
			$(el).animate({ "top": "-=20px" }, speed/2, "swing", function () {
				$(el).animate({ "top": "+=20px" }, speed/2);
			});
		},

		moveToFront : function() {
			$(this.el).css('z-index', zIndexCounter++);
		}		
	};
	
	function Container() {
	
	}
	
	Container.prototype = new Array();
	Container.prototype.extend = function(obj) {
		for (var prop in obj) {
			this[prop] = obj[prop];
		}
	}
	Container.prototype.extend({
		addCard : function(card) {
			this.addCards([card]);
		},
		
		addCards : function(cards) {
			for (var i = 0; i < cards.length;i++) {
				var card = cards[i];
				if (card.container) {
					card.container.removeCard(card);
				}
				this.push(card);
				card.container = this;
			}
		},
		
		removeCard : function(card) {
			for (var i=0; i< this.length;i++) {
				if (this[i] == card) {
					this.splice(i, 1);
					return true;
				}
			}
			return false;
		},

		getNum : function() {
			var ret = { c:0, d:0, h:0, s:0};
			for (var i=0; i< this.length;i++) {
				ret[this[i].suit] += 1;
			}
			return ret;
		},

		getSortOrder : function() {
			var a = this.getNum();
			if(a['s'] != 0) {
				if(a['d'] != 0) {
						if(a['h'] != 0) {
							if(a['c'] != 0)
								return ['s', 'd', 'c', 'h'];
							else 
								return ['d', 's', 'h', 'c'];
						} else {
							return ['s', 'd', 'c', 'h'];
						}
				} else {
					return ['s', 'd', 'h', 'c'];
				}
			} else {
				if(a['d'] == 0)
					return ['s', 'd', 'h', 'c'];
				else
					return ['d', 'c', 'h', 's'];
			}
		},

		sortHand : function() {
			var ord = this.getSortOrder();
			this.sort(function (a,b) {
				var ai = ord.indexOf(a.suit);
				var bi = ord.indexOf(b.suit);
				if(ai == bi) return a.rank - b.rank;
				return ai - bi;
			});
		},

		init : function(options) {
			options = options || {};
			this.x = options.x || $(opt.table).width()/2;
			this.y = options.y || $(opt.table).height()/2;
			this.faceUp = options.faceUp;
		},

		off : function() {
			this._click = null;
		},

		click : function(func, context) {
			this._click = {func:func,context:context};
		},

		mousedown : function(func, context) {
			this._mousedown = {func:func,context:context};
		},
		
		mouseup : function(func, context) {
			this._mouseup = {func:func,context:context};
		},
		
		hide : function(after) {
			var speed = opt.animationSpeed;
			for (var i=0;i<this.length;i++) {
				var card = this[i];
				$(card.el).hide();
			}
		},

		render : function(options) {
			options = options || {};
			var speed = options.speed || opt.animationSpeed;
			this.calcPosition(options);
			for (var i=0;i<this.length;i++) {
				var card = this[i];
				//zIndexCounter++;
				card.moveToFront();
				$(card.el).show();
				var top = parseInt($(card.el).css('top'));
				var left = parseInt($(card.el).css('left'));
				if (top != card.targetTop || left != card.targetLeft) {
					var props = {top:card.targetTop, left:card.targetLeft, opacity: 1, queue:false};
					if (options.immediate) {
						$(card.el).animate(props, 0);
						//$(card.el).css(props);
					} else {
						$(card.el).animate(props, speed);
					}
				}
			}
			var me = this;
			var flip = function(){
				for (var i=0;i<me.length;i++) {
					if (me.faceUp) {
						me[i].showCard();
					} else {
						me[i].hideCard();
					}
				}
			}
			if (options.immediate) {
				flip();
			} else {
				setTimeout(flip, speed /2);
			}
			
			if (options.callback) {
				setTimeout(options.callback, speed);
			}
		},
		
		topCard : function() {
			return this[this.length-1];
		},

		findcard : function (card)
		{
			for(var i=0; i<this.length; i++)
				if(this[i].rank == card.rank && this[i].suit == card.suit)
					return i;
			return -1;
		},

		findcardnum: function(num) {
			return this.findcard({ suit: num2suit(num>>3), rank: (num&0x7)+7 });
		
		},

		getcards4num : function (dcopy)
		{
			var crd = [];
			for(var i=0; i<dcopy.length; i++) {
				var j = this.findcard({ suit: num2suit(dcopy[i]>>3), rank: (dcopy[i]&0x7)+7 });
				if(j>=0)
					crd.push(this[j]);
			}
			return crd;
		},

		slozi : function(dcopy) {
			for(var i=0; i<dcopy.length; i++) {
				var j = this.findcard({ suit: num2suit(dcopy[i]>>3), rank: (dcopy[i]&0x7)+7 })
				if(j>=0) {
					var t = this[j];
					this.splice(j,1);
					this.push(t);
				}
			}
		},
	
		toString: function() {
			return 'Container';
		}
	});
	
	function Deck(options) {
		this.init(options);
	}
	
	Deck.prototype = new Container();
	Deck.prototype.extend({
		calcPosition : function(options) {
			options = options || {};
			var left = Math.round(this.x-opt.cardSize.width/2, 0);
			var top = Math.round(this.y-opt.cardSize.height/2, 0);
			var condenseCount = 6;
			for (var i=0;i<this.length;i++) {
				if (i > 0 && i % condenseCount == 0) {
					top-=1;
					left-=1;
				}
				this[i].targetTop = top;
				this[i].targetLeft = left;
			}
		},
		
		toString : function() {
			return 'Deck';
		},
		
		deal : function(count, hands, speed, callback) {
			var me = this;
			var i = 0;
			var totalCount = count*hands.length;
			function dealOne() {
				if (me.length == 0 || i == totalCount) {
					if(!speed) {
						for(var j=0; j<hands.length; j++)
							hands[j].render({immediate:true});
					}
					if (callback) {
						callback();
					}
					return;
				}
				var y = Math.floor(i/count);
				hands[y].addCard(me.topCard());
				i++;
				if(!speed)
					dealOne();
				else
					hands[y].render({callback:dealOne, speed:speed});
			}
			dealOne();
		}
	});

	function Hand(options) {
		this.init(options);
	}
	Hand.prototype = new Container();
	Hand.prototype.extend({
		calcPosition : function(options) {
			options = options || {};
			var width = opt.cardSize.width + (this.length-1)*opt.cardSize.padding;
			var left = Math.round(this.x - width/2);
			var top = Math.round(this.y-opt.cardSize.height/2, 0);
			for (var i=0;i<this.length;i++) {
				this[i].targetTop = top;
				this[i].targetLeft = left+i*opt.cardSize.padding;
			}
		},
		
		toString : function() {
			return 'Hand';
		}
	});
	
	function Pile(options) {
		this.init(options);
	}
	
	Pile.prototype = new Container();
	Pile.prototype.extend({
		calcPosition : function(options) {
			options = options || {};
		},
		
		toString : function() {
			return 'Pile';
		},
		
		deal : function(count, hands) {
			if (!this.dealCounter) {
				this.dealCounter = count * hands.length;
			}
		}
	});
	

	return {
		init : init,
		all : all,
		options : opt,
		SIZE : opt.cardSize,
		Card : Card,
		Container : Container,
		Deck : Deck,
		Hand : Hand,
		Pile : Pile,
		shuffle: shuffle,
		copy: copy,
		suit2num: suit2num,
		num2suit: num2suit
};
})();

if (typeof module !== 'undefined') {
    module.exports = cards;
}

