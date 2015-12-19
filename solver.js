var board;
var rows,cols,iblocks,oblocks,tblocks,jblocks,lblocks,sblocks,zblocks,nPieces;
var I = 'i', O = 'o', T = 't', J = 'j', L = 'l', S = 's', Z = 'z';
var blocks;
var blocksPtr=0;

this.addEventListener('message', function(e){
	var params=e.data.split(" ");

	if(params[0].indexOf("s")==0){
		rows=Number(params[1]);
		cols=Number(params[2]);
		iblocks=Number(params[3]);
		oblocks=Number(params[4]);
		tblocks=Number(params[5]);
		jblocks=Number(params[6]);
		lblocks=Number(params[7]);
		sblocks=Number(params[8]);
		zblocks=Number(params[9]);
		nPieces=iblocks+oblocks+tblocks+jblocks+lblocks+sblocks+zblocks;
		blocks=new Array(nPieces);
		for (var i = 0; i < iblocks; i++) {
            blocks[blocksPtr++] = I;
        }
        for (var i = 0; i < oblocks; i++) {
            blocks[blocksPtr++] = O;
        }
        for (var i = 0; i < tblocks; i++) {
            blocks[blocksPtr++] = T;
        }
        for (var i = 0; i < jblocks; i++) {
            blocks[blocksPtr++] = J;
        }
        for (var i = 0; i < lblocks; i++) {
            blocks[blocksPtr++] = L;
        }
        for (var i = 0; i < sblocks; i++) {
            blocks[blocksPtr++] = S;
        }
        for (var i = 0; i < zblocks; i++) {
            blocks[blocksPtr++] = Z;
        }
        blocksPtr=0;
		
		board=new Array(rows);
		for(var y=0;y<board.length;y++){board[y]=new Array(cols); for(var x=0;x<board[0].length;x++) board[y][x]=0;}
		
		solve();
	}
}, false);

function sendBoard(){
	if(board){
		var s="grid "+board.length+" "+board[0].length+" ";
		for(var y=0;y<board.length;y++) for(var x=0;x<board[0].length;x++) s+=board[y][x]+" ";
		postMessage(s);
	}
}

var t=Date.now();
function solve(){
	if(nPieces*4!=rows*cols) postMessage("impossible"); //cannot be filled by tetraminos
	else if(s(1)){sendBoard(); postMessage("solved");}else postMessage("impossible");
}

function isOccupied(y, x) {
        return y >= 0 && y < rows && x >= 0 && x < cols ? board[y][x] != 0 : true;
}

function group(y,x){
	if (y >= 0 && y < rows && x >= 0 && x < cols && board[y][x] == 0) {
		board[y][x] = -1;
		return 1 + group(y, x + 1) + group(y, x - 1) + group(y + 1, x) + group(y - 1, x);
	}
	return 0;  
}

function clearGroups(){
	for (var y = 0; y < rows; y++) {
		for (var x = 0; x < cols; x++) {
			if (board[y][x] == -1) {
				board[y][x] = 0;
			}
		}
	}
}

function isStupidConfig(){
	for (var y = 0; y < rows; y++) {
		for (var x = 0; x < cols; x++) {
			if (board[y][x] == 0) {
				if (group(y, x) % 4 != 0) {
					clearGroups();
					return true; //cannot be filled by tetraminos, stupid config
				}
			}
		}
	}
	clearGroups();
	return false;
}

function s(p){
	if(Date.now()-t>20){
		sendBoard();
		t=Date.now();
	}
	if (blocksPtr>=blocks.length) {
		return true;   //puzzle is solved
	}
	var block=blocks[blocksPtr++];
	if (block == I) {
		//I shaped block can have 2 rotations.
		/*
		 #
		 #
		 #
		 #
		 */
		for (var y = 0; y <= rows - 4; y++) {
			for (var x = 0; x <= cols - 1; x++) {
				if (board[y][x] == 0 && board[y + 1][x] == 0 && board[y + 2][x] == 0 && board[y + 3][x] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x] = p;
					board[y + 1][x] = p;
					board[y + 2][x] = p;
					board[y + 3][x] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}
					//otherwise, we need to find another place
					board[y][x] = 0;
					board[y + 1][x] = 0;
					board[y + 2][x] = 0;
					board[y + 3][x] = 0;
				}
			}
		}
		// ####
		for (var y = 0; y <= rows - 1; y++) {
			for (var x = 0; x <= cols - 4; x++) {
				if (board[y][x] == 0 && board[y][x + 1] == 0 && board[y][x + 2] == 0 && board[y][x + 3] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x] = p;
					board[y][x + 1] = p;
					board[y][x + 2] = p;
					board[y][x + 3] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x] = 0;
					board[y][x + 1] = 0;
					board[y][x + 2] = 0;
					board[y][x + 3] = 0;
				}
			}
		}
		//we couldn't fina a suitable place for this block, that means that the puzzle is either unsolveable or one of the pieces is in the wrong place
		//let's put the piece back in the list and continue searching
		blocksPtr--;
		return false; //0=couldn't find a place for this block
	}
	if (block == O) {
		//2x2 square block can have only 1 rotation
		for (var y = 0; y <= rows - 2; y++) {
			for (var x = 0; x <= cols - 2; x++) {
				if (board[y][x] == 0 && board[y + 1][x] == 0 && board[y][x + 1] == 0 && board[y + 1][x + 1] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x] = p;
					board[y + 1][x] = p;
					board[y][x + 1] = p;
					board[y + 1][x + 1] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x] = 0;
					board[y + 1][x] = 0;
					board[y][x + 1] = 0;
					board[y + 1][x + 1] = 0;
				}
			}
		}
		//we couldn't fina a suitable place for this block, that means that the puzzle is either unsolveable or one of the pieces is in the wrong place
		//let's put the piece back in the list and continue searching
		blocksPtr--;
		return false; //0=couldn't find a place for this block
	}

	if (block == T) {
		//T shaped block can have 4 rotations
		/*
		 ###
		 _#
		 */
		for (var y = 0; y <= rows - 2; y++) {
			for (var x = 0; x <= cols - 3; x++) {
				if (board[y][x] == 0 && board[y][x + 1] == 0 && board[y + 1][x + 1] == 0 && board[y][x + 2] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x] = p;
					board[y][x + 1] = p;
					board[y + 1][x + 1] = p;
					board[y][x + 2] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x] = 0;
					board[y][x + 1] = 0;
					board[y + 1][x + 1] = 0;
					board[y][x + 2] = 0;
				}
			}
		}
		/*
		 #
		 ##
		 #
		 */
		for (var y = 0; y <= rows - 3; y++) {
			for (var x = 0; x <= cols - 2; x++) {
				if (board[y][x] == 0 && board[y + 1][x] == 0 && board[y + 1][x + 1] == 0 && board[y + 2][x] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x] = p;
					board[y + 1][x] = p;
					board[y + 1][x + 1] = p;
					board[y + 2][x] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x] = 0;
					board[y + 1][x] = 0;
					board[y + 1][x + 1] = 0;
					board[y + 2][x] = 0;
				}
			}
		}
		/*
		 _#
		 ##
		 _#
		 */
		for (var y = 0; y <= rows - 3; y++) {
			for (var x = 0; x <= cols - 2; x++) {
				if (board[y][x + 1] == 0 && board[y + 1][x] == 0 && board[y + 1][x + 1] == 0 && board[y + 2][x + 1] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x + 1] = p;
					board[y + 1][x] = p;
					board[y + 1][x + 1] = p;
					board[y + 2][x + 1] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x + 1] = 0;
					board[y + 1][x] = 0;
					board[y + 1][x + 1] = 0;
					board[y + 2][x + 1] = 0;
				}
			}
		}
		/*
		 _#
		 ###
		 */
		for (var y = 0; y <= rows - 2; y++) {
			for (var x = 0; x <= cols - 3; x++) {
				if (board[y + 1][x] == 0 && board[y][x + 1] == 0 && board[y + 1][x + 1] == 0 && board[y + 1][x + 2] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y + 1][x] = p;
					board[y][x + 1] = p;
					board[y + 1][x + 1] = p;
					board[y + 1][x + 2] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y + 1][x] = 0;
					board[y][x + 1] = 0;
					board[y + 1][x + 1] = 0;
					board[y + 1][x + 2] = 0;
				}
			}
		}
		//we couldn't fina a suitable place for this block, that means that the puzzle is either unsolveable or one of the pieces is in the wrong place
		//let's put the piece back in the list and continue searching
		blocksPtr--;
		return false; //0=couldn't find a place for this block
	}

	if (block == J) {
		//J shaped block can have 4 rotations
		/*
		 ###
		 __#
		 */
		for (var y = 0; y <= rows - 2; y++) {
			for (var x = 0; x <= cols - 3; x++) {
				if (board[y][x] == 0 && board[y][x + 1] == 0 && board[y + 1][x + 2] == 0 && board[y][x + 2] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x] = p;
					board[y][x + 1] = p;
					board[y + 1][x + 2] = p;
					board[y][x + 2] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x] = 0;
					board[y][x + 1] = 0;
					board[y + 1][x + 2] = 0;
					board[y][x + 2] = 0;
				}
			}
		}
		/*
		 #
		 ###
		 */
		for (var y = 0; y <= rows - 2; y++) {
			for (var x = 0; x <= cols - 3; x++) {
				if (board[y + 1][x] == 0 && board[y][x] == 0 && board[y + 1][x + 1] == 0 && board[y + 1][x + 2] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y + 1][x] = p;
					board[y][x] = p;
					board[y + 1][x + 1] = p;
					board[y + 1][x + 2] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y + 1][x] = 0;
					board[y][x] = 0;
					board[y + 1][x + 1] = 0;
					board[y + 1][x + 2] = 0;
				}
			}
		}
		/*
		 ##
		 #
		 #
		 */
		for (var y = 0; y <= rows - 3; y++) {
			for (var x = 0; x <= cols - 2; x++) {
				if (board[y][x] == 0 && board[y + 1][x] == 0 && board[y][x + 1] == 0 && board[y + 2][x] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x] = p;
					board[y + 1][x] = p;
					board[y][x + 1] = p;
					board[y + 2][x] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x] = 0;
					board[y + 1][x] = 0;
					board[y][x + 1] = 0;
					board[y + 2][x] = 0;
				}
			}
		}
		/*
		 _#
		 _#
		 ##
		 */
		for (var y = 0; y <= rows - 3; y++) {
			for (var x = 0; x <= cols - 2; x++) {
				if (board[y][x + 1] == 0 && board[y + 2][x] == 0 && board[y + 1][x + 1] == 0 && board[y + 2][x + 1] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x + 1] = p;
					board[y + 2][x] = p;
					board[y + 1][x + 1] = p;
					board[y + 2][x + 1] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x + 1] = 0;
					board[y + 2][x] = 0;
					board[y + 1][x + 1] = 0;
					board[y + 2][x + 1] = 0;
				}
			}
		}
		//we couldn't fina a suitable place for this block, that means that the puzzle is either unsolveable or one of the pieces is in the wrong place
		//let's put the piece back in the list and continue searching
		blocksPtr--;
		return false; //0=couldn't find a place for this block
	}

	if (block == L) {
		//L shaped block can have 4 rotations
		/*
		 ###
		 #
		 */
		for (var y = 0; y <= rows - 2; y++) {
			for (var x = 0; x <= cols - 3; x++) {
				if (board[y][x] == 0 && board[y][x + 1] == 0 && board[y + 1][x] == 0 && board[y][x + 2] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x] = p;
					board[y][x + 1] = p;
					board[y + 1][x] = p;
					board[y][x + 2] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x] = 0;
					board[y][x + 1] = 0;
					board[y + 1][x] = 0;
					board[y][x + 2] = 0;
				}
			}
		}
		/*
		 #
		 #
		 ##
		 */
		for (var y = 0; y <= rows - 3; y++) {
			for (var x = 0; x <= cols - 2; x++) {
				if (board[y][x] == 0 && board[y + 1][x] == 0 && board[y + 2][x + 1] == 0 && board[y + 2][x] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x] = p;
					board[y + 1][x] = p;
					board[y + 2][x + 1] = p;
					board[y + 2][x] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x] = 0;
					board[y + 1][x] = 0;
					board[y + 2][x + 1] = 0;
					board[y + 2][x] = 0;
				}
			}
		}
		/*
		 ##
		 _#
		 _#
		 */
		for (var y = 0; y <= rows - 3; y++) {
			for (var x = 0; x <= cols - 2; x++) {
				if (board[y][x + 1] == 0 && board[y][x] == 0 && board[y + 1][x + 1] == 0 && board[y + 2][x + 1] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x + 1] = p;
					board[y][x] = p;
					board[y + 1][x + 1] = p;
					board[y + 2][x + 1] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x + 1] = 0;
					board[y][x] = 0;
					board[y + 1][x + 1] = 0;
					board[y + 2][x + 1] = 0;
				}
			}
		}
		/*
		 __#
		 ###
		 */
		for (var y = 0; y <= rows - 2; y++) {
			for (var x = 0; x <= cols - 3; x++) {
				if (board[y + 1][x] == 0 && board[y][x + 2] == 0 && board[y + 1][x + 1] == 0 && board[y + 1][x + 2] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y + 1][x] = p;
					board[y][x + 2] = p;
					board[y + 1][x + 1] = p;
					board[y + 1][x + 2] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y + 1][x] = 0;
					board[y][x + 2] = 0;
					board[y + 1][x + 1] = 0;
					board[y + 1][x + 2] = 0;
				}
			}
		}
		//we couldn't fina a suitable place for this block, that means that the puzzle is either unsolveable or one of the pieces is in the wrong place
		//let's put the piece back in the list and continue searching
		blocksPtr--;
		return false; //0=couldn't find a place for this block
	}

	if (block == S) {
		//S shaped block can have 2 rotations
		/*
		 #
		 ##
		 _#
		 */
		for (var y = 0; y <= rows - 3; y++) {
			for (var x = 0; x <= cols - 2; x++) {
				if (board[y][x] == 0 && board[y + 1][x] == 0 && board[y + 1][x + 1] == 0 && board[y + 2][x + 1] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x] = p;
					board[y + 1][x] = p;
					board[y + 1][x + 1] = p;
					board[y + 2][x + 1] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x] = 0;
					board[y + 1][x] = 0;
					board[y + 1][x + 1] = 0;
					board[y + 2][x + 1] = 0;
				}
			}
		}
		/*
		 _##
		 ##
		 */
		for (var y = 0; y <= rows - 2; y++) {
			for (var x = 0; x <= cols - 3; x++) {
				if (board[y][x + 1] == 0 && board[y][x + 2] == 0 && board[y + 1][x] == 0 && board[y + 1][x + 1] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x + 1] = p;
					board[y][x + 2] = p;
					board[y + 1][x] = p;
					board[y + 1][x + 1] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x + 1] = 0;
					board[y][x + 2] = 0;
					board[y + 1][x] = 0;
					board[y + 1][x + 1] = 0;
				}
			}
		}
		//we couldn't fina a suitable place for this block, that means that the puzzle is either unsolveable or one of the pieces is in the wrong place
		//let's put the piece back in the list and continue searching
		blocksPtr--;
		return false; //0=couldn't find a place for this block
	}

	if (block == Z) {
		//Z shaped block can have 2 rotations
		/*
		 **
		 _**
		 */
		for (var y = 0; y <= rows - 2; y++) {
			for (var x = 0; x <= cols - 3; x++) {
				if (board[y][x] == 0 && board[y][x + 1] == 0 && board[y + 1][x + 1] == 0 && board[y + 1][x + 2] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x] = p;
					board[y][x + 1] = p;
					board[y + 1][x + 1] = p;
					board[y + 1][x + 2] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x] = 0;
					board[y][x + 1] = 0;
					board[y + 1][x + 1] = 0;
					board[y + 1][x + 2] = 0;
				}
			}
		}
		/*
		 _#
		 ##
		 #
		 */
		for (var y = 0; y <= rows - 3; y++) {
			for (var x = 0; x <= cols - 2; x++) {
				if (board[y][x + 1] == 0 && board[y + 1][x] == 0 && board[y + 1][x + 1] == 0 && board[y + 2][x] == 0) {
					//we found a hole that fits this block, we'll place it here and see if the puzzle can be solved
					board[y][x + 1] = p;
					board[y + 1][x] = p;
					board[y + 1][x + 1] = p;
					board[y + 2][x] = p;
					if(!isStupidConfig()) if (s(p + 1)) {
						return true; //this is the right place for this block
					}                        //otherwise, we need to find another place
					board[y][x + 1] = 0;
					board[y + 1][x] = 0;
					board[y + 1][x + 1] = 0;
					board[y + 2][x] = 0;
				}
			}
		}
		//we couldn't fina a suitable place for this block, that means that the puzzle is either unsolveable or one of the pieces is in the wrong place
		//let's put the piece back in the list and continue searching
		blocksPtr--;
		return false; //0=couldn't find a place for this block
	}
}





