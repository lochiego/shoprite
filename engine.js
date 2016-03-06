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

var working_items = [];
var filters = [];

// 'viciously' copy-pasted from stackoverflow answer
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function createItem(item, parent) {
	var location = item.location;
	var itemNode = document.createElement("li");
	itemNode.className = "item-node";
	var anchorNode = document.createElement("a");
	var att = document.createAttribute("data-toggle");
	att.value = "modal";
	anchorNode.setAttributeNode(att);
	att = document.createAttribute("href");
	att.value = "#laptopModal";
	anchorNode.setAttributeNode(att);

	var options = {};

	bsService.loadMetadata(location, options, function itemData(err, metadataAndMetametaData){
		//To make metadata easier to use via js, first unwrap it (it's initially wrapped for cross-compatibility with C#)
		var unwrappedMetadata = BSUtils.unwrap(metadataAndMetametaData.metadata);
		var itemDetails = unwrappedMetadata;

		try {
			var product = new laptop(itemDetails);
			working_items.push(product);

			var att = document.createAttribute("data-product-index");
			att.value = working_items.length-1;
			anchorNode.setAttributeNode(att);

			var nameNode = document.createElement("h3");
			var title = product.laptopTitle();
			var itemName = document.createTextNode(title);
			nameNode.appendChild(itemName);

			var imageUrl = product.imageUrl;
			var imageNode = document.createElement("img");
			imageNode.src = imageUrl;
			imageNode.alt = title;

			anchorNode.appendChild(imageNode);
			anchorNode.appendChild(nameNode);

			// Add top features from filter or basic ones if not available
			var featuresNode = document.createElement("ul");

			if (filters.count > 0) {
				// Price should always be shown
				addFeatureText("$" + product.price, featuresNode);
			} else {	// Use stock comparisons in lieu of user-specified ones
				// price
				addFeatureText("$" + product.price, featuresNode);

				// Memory
				var mem = product.memory;
				if (mem != null) {
					addFeatureText(mem, featuresNode);
				}

				// Storage
				var storage = product.storage;
				if (storage != null) {
					addFeatureText(storage, featuresNode);
				}

				// Display size
				var display = product.screen;
				if (display != null) {
					addFeatureText(display, featuresNode);
				}
			}

			anchorNode.appendChild(featuresNode);
			itemNode.appendChild(anchorNode);
			parent.appendChild(itemNode);
		}
		catch(e){
			console.log(e.stack);
		}
	});
}

function laptop(item) {
	var specTable = item.specifications_table;
	var modelTable = specTable[0];
	this.laptopTitle = function() {
		return this.brand + " " + this.series;
	}
	this.price = randomIntFromInterval(20,80) * 10 - 0.01;
 	this.imageUrl = item.main_images[0].location;
	this.brand = findFeature("Brand", specTable);
	this.series = findFeature("Series", specTable);
	this.os = findFeature("Operating System", specTable);
	this.cpu = findFeature("CPU Type", specTable);
	this.screen = findFeature("Screen", specTable);
	this.memory = findFeature("Memory", specTable);
	this.storage = findFeature("Storage", specTable);
	this.gpu = findFeature("Graphics Card", specTable);
	this.gpuMem = findFeature("Video Memory", specTable);
	this.weight = findFeature("Weight", specTable);
	this.resolution = findFeature("Resolution", specTable);
	this.touchscreen = findFeature("Touchscreen", specTable);
	this.battery = findFeature("Battery Life", specTable);
	this.hwStyle = findFeature("Style", specTable);
	var reviews = item.reviews;
	var rating = 0;
	for (review of reviews) {
		rating += parseInt(review.rating);
	}
	if (rating > 0) {
		rating = rating/reviews.length;
	}
	this.rating = Math.round( rating * 10 ) / 10;
	this.reviewCount = reviews.length;
}

var specTitles = [
	"Brand",
	"Series",
	"Operating System",
	"CPU",
	"Screen",
	"Memory",
	"Storage",
	"Graphics Card",
	"Video Memory",
	"Weight",
	"Resolution",
	"Touchscreen",
	"Battery Life",
	"Style"
]

function findFeature(feature, spec_table) {
	try {
		for (table of spec_table) {
			for (spec of table.specifications) {
				if (spec.name == feature)
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


function constructFilters() {
	var element = document.getElementById("filters");

	var htmlChunks =[];
	htmlChunks.push(constructPriceFilter());
	htmlChunks.push(constructBrandFilter());
	htmlChunks.push(constructOSFilter());
	htmlChunks.push(constructCPUFilter());
	htmlChunks.push(constructScreenFilter());
	htmlChunks.push(constructMemoryFilter());
	htmlChunks.push(constructStorageFilter());
	htmlChunks.push(constructGPUFilter());
	htmlChunks.push(constructWeightFilter());
	htmlChunks.push(constructResolutionFilter());
	htmlChunks.push(constructTouchFilter());
	htmlChunks.push(constructBatteryFilter());
	htmlChunks.push(constructStyleFilter());

	htmlChunks.push("<button id='apply' type='button' class='btn btn-primary'>Apply</button>");

	element.innerHTML = htmlChunks.join("");
}

function constructFilter(name,options) {
	try {
		var string = ["<div class='panel-group'><div class='panel panel-default'>",
		"<a data-toggle='collapse' href='#"+name+"'>",
		"<div class='panel-heading'><h4 class='panel-title'>"+name,
		"</h4></div><div id='"+name+"' class='panel-collapse collapse'>",
		"</a>",
		"<ul class='list-group'>"];

		for (option of options) {
			string.push("<li class='list-group-item'>" + option + "</li>");
		}
		string.push("</ul></div></div></div>");
		return string.join("");
	}
	catch(e) {
		console.log(e.stack);
	}
	return "";
}

function constructPriceFilter() {
	return constructFilter("Price", ["$100 - $200", "$200 - $400", "$400 - $600", "$600 - $800"]);
}

function constructBrandFilter() {
	return constructFilter("Brand",["Acer", "Apple", "ASUS", "Dell", "Gateway", "HP", "Lenovo", "MSI", "Samsung", "Sony", "ThinkPad", "Toshiba"]);
}

function constructOSFilter() {
	return constructFilter("OS", ["Windows", "Mac OS", "Chrome", "Linux"]);
}

function constructCPUFilter() {
	return constructFilter("CPU", ["Intel", "AMD"]);
}

function constructScreenFilter() {
	return constructFilter("Size", ["11\"", "12\"", "13\"", "14\"", "15\"", "16\"", "17\""]);
}

function  constructMemoryFilter() {
	return constructFilter("Memory", ["2 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB", "24 GB", "32 GB", "64 GB"]);
}

function constructStorageFilter() {
	return constructFilter("Storage", ["120 GB", "240 GB", "500 GB", "1 TB", "2 TB"]);
}

function constructGPUFilter() {
	return constructFilter("GPU", ["NVIDIA GeForce", "AMD Radeon", "Intel Graphics", "AMD FirePro", "ATI Mobility"]);
}

function constructWeightFilter() {
	return constructFilter("Weight", ["< 2 lbs", "2 - 2.9 lbs", "3 - 3.9 lbs", "4 - 4.9 lbs", "5 - 5.9 lbs", "6 - 6.9 lbs", "> 7 lbs"]);
}

function constructResolutionFilter() {
	return constructFilter("Resolution", ["1024 x 768", "1280 x 800", "1366 x 768", "1440 x 900", "1600 x 900", "1920 x 1080", "2560 x 1440", "2880 x 1620"]);
}

function constructTouchFilter() {
	return constructFilter("Touchscreen", ["No","Yes"]);
}

function constructBatteryFilter() {
 return constructFilter("Battery", ["2-3 hrs", "3-4 hrs", "4-5 hrs","5-6 hrs", "6-7 hrs", "7-8 hrs"]);
}

function constructStyleFilter() {

}
