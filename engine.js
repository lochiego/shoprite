/*
	Before the page loads, we create a bsService object. Do not change the name - that will break stuff :(
		The arguments passed in are a list of strings. Each string is an extensionID. these particular ID's are
		for the released version of the IdeaMACHE plugin and for a secret, special version of the extension
		that I have
	bsService will see if any of the extenions are availabe. If so it will use them. Otherwise, it will rely on the
		web-hosted version of bigsemantics

	 */

var bsService = new BSAutoSwitch(['elkanacmmmdgbnhdjopfdeafchmhecbf', 'gdgmmfgjalcpnakohgcfflgccamjoipd ']);

/*
Called on the data-only page
*/
function onLoadSemantics(url){
	/*
	Let's break down the arguments.
		-url: the URL you want metadata for
		-options: If you already have meta-metadata, you can pass it in here so prevent double extraction.
		-callback: your function that will asynchronously recieve metadata
	*/

	var options = {};
	var callback = foundData;
	bsService.loadMetadata(url, options, callback);
}

// Ignore this. I just use it to make numbers slightly prettier -- visciously copy-pasted from stack overflow:
// http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript

function numberWithCommas(x) {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//The first argument passed to callback is an error message. in this case its null <3

function foundData(err, metadataAndMetametaData){

	//To make metadata easier to use via js, first unwrap it (it's initially wrapped for cross-compatibility with C#)
	var unwrappedMetadata = BSUtils.unwrap(metadataAndMetametaData.metadata);
	//Before using the data, i kill off my loading indicator
	$('.loadingGifOfDoom').remove();

	//never trust metadata! Like file I/O you should wrap it try catch statements
	try{
		// browseCont.appendChild(youtubeThumbnail); // Instead append each of the images
    var listNode = document.getElementById("item-list");
    for (item of unwrappedMetadata.items) {
      createItem(item, listNode);
    }
    var browseCont = document.getElementById('browse-content');
    browseCont.appendChild(listNode);
	}catch(e){
		var textOutput = e.message;
		var textNode = document.createTextNode(textOutput);
		var textHold = document.getElementById('error-output');
		textHold.appendChild(textNode);
	}
}

function createItem(item, parent) {
  var location = item.location;
  var itemNode = document.createElement("li")
  itemNode.className = "item-node";

  var options = {};

  bsService.loadMetadata(location, options, function itemData(err, metadataAndMetametaData){
    //To make metadata easier to use via js, first unwrap it (it's initially wrapped for cross-compatibility with C#)
    var unwrappedMetadata = BSUtils.unwrap(metadataAndMetametaData.metadata);
   var item = unwrappedMetadata;
   var specTable = item.specifications_table[0];
   var detailsTable = specTable.specifications;
   var title = detailsTable[0].value + " " + detailsTable[1].value;
   var itemName = document.createTextNode(title);

   var imageUrl = item.main_images[0].location;
   var imageNode = document.createElement("img");
   imageNode.src = imageUrl;
   imageNode.alt = title;

   itemNode.appendChild(imageNode);
   itemNode.appendChild(itemName);

  });

  parent.appendChild(itemNode);
}
