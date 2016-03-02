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
			item.price = randomIntFromInterval(20,80) * 10 - 0.01;
			createItem(item, listNode);
		}

		working_items = unwrappedMetadata.items;
		var browseCont = document.getElementById('browse-content');
		browseCont.appendChild(listNode);
	}catch(e){
		var textOutput = e.message;
		var textNode = document.createTextNode(textOutput);
		var textHold = document.getElementById('error-output');
		textHold.appendChild(textNode);
	}
}

var working_items;
var filters = [];

// 'viciously' copy-pasted from stackoverflow answer
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function createItem(item, parent) {
	var location = item.location;
	var itemNode = document.createElement("li")
	itemNode.className = "item-node";

	var options = {};

	bsService.loadMetadata(location, options, function itemData(err, metadataAndMetametaData){
		//To make metadata easier to use via js, first unwrap it (it's initially wrapped for cross-compatibility with C#)
		var unwrappedMetadata = BSUtils.unwrap(metadataAndMetametaData.metadata);
		var itemDetails = unwrappedMetadata;

		try {
		var specTable = itemDetails.specifications_table[0];
		var detailsTable = specTable.specifications;

		var nameNode = document.createElement("h3");
		var title = detailsTable[0].value + " " + detailsTable[1].value;
		var itemName = document.createTextNode(title);
		nameNode.appendChild(itemName);

		var imageUrl = itemDetails.main_images[0].location;
		var imageNode = document.createElement("img");
		imageNode.src = imageUrl;
		imageNode.alt = title;

		itemNode.appendChild(imageNode);
		itemNode.appendChild(nameNode);

		// Add top features from filter or basic ones if not available
		var featuresNode = document.createElement("ul");

		if (filters.count > 0) {

			// Price should always be shown
			addFeatureText("$" + item.price, featuresNode);
		} else {	// Use stock comparisons in lieu of user-specified ones
			// price
			addFeatureText("$" + item.price, featuresNode);

			// Memory
			var mem = findFeature("memory", itemDetails.specifications_table);
			if (mem != null) {
				addFeatureText(mem, featuresNode);
			}

			// Storage
			var storage = findFeature("storage", itemDetails.specifications_table);
			if (storage != null) {
				addFeatureText(storage, featuresNode);
			}

			// Display size
			var display = findFeature("screen_size", itemDetails.specifications_table);
			if (display != null) {
				addFeatureText(display, featuresNode);
			}
		}

		itemNode.appendChild(featuresNode);

		parent.appendChild(itemNode);
	}
	catch(e){

	}
	});
}

var specTitles = {
	"brand":"Brand",
	"series":"Series",
	"os":"Operating System",
	"cpu":"CPU",
	"screen_size":"Screen",
	"memory":"Memory",
	"storage":"Storage",
	"gpu":"Graphics Card",
	"gpu_memory":"Video Memory",
	"weight":"Weight",
	"screen_resolution":"Resolution",
	"touch":"Touchscreen",
	"battery":"Battery Life",
	"style":"Style"
}

function findFeature(feature, spec_table) {
	try {
	var featureName = specTitles[feature];
	for (table of spec_table) {
		for (spec of table.specifications) {
			if (spec.name == featureName)
			 return spec.value;
		}
	}
} catch(e) {
	console.log(e.stack);
}
	return null;
}

function addFeatureText(text, parent) {
	var listNode = document.createElement("li");
	var textNode = document.createTextNode(text);
	listNode.appendChild(textNode);
	parent.appendChild(listNode);
}
