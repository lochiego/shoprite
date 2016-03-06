function dragItem(event) {
  event.dataTransfer.setData("item-index",event.target.getAttribute('data-product-index'));
}

function allowDrop(ev) {
  ev.preventDefault();
}

var sidebarItems = new Set();

function loadSideItems() {
  var string = sessionStorage.getItem('personals')
  var parsedItems = $.parseJSON(string);
  if (parsedItems.length > 0) {
    var laptopTitle = function() {
      return this.brand + " " + this.series;
    }
    for (item of parsedItems) {
      item.laptopTitle = laptopTitle;
      sidebarItems.add(item);
      insertLaptop(item);
    }
  }
}

function addSideItem(laptop) {
  sidebarItems.add(laptop);
  sessionStorage.setItem('personals', JSON.stringify([...sidebarItems]));
}

function removeSideItem(laptop) {
  sidebarItems.delete(item);
  sessionStorage.setItem('personals', JSON.stringify([...sidebarItems]));
}

function dropItem(ev) {
  ev.preventDefault();
  var itemIndex = ev.dataTransfer.getData("item-index");
  var item = filtered_items[itemIndex];
  if (!sidebarItems.has(item)) {
    addSideItem(item);
    insertLaptop(item);
  }
}

function insertLaptop(laptop) {
  document.getElementById('scratchpad').appendChild(sidebarVersion(laptop));
}

function sidebarVersion(laptop) {
  var div = document.createElement("div");
  div.className = "sidebar-item-node";
  div.laptop = laptop;
  div.innerHTML = "<button type='button' class='close' onclick=removeItem(event)>&times;</button><img src="+laptop.imageUrl+" alt="+laptop.laptopTitle()+"><h4>"+laptop.laptopTitle()+"</h4>"

  return div;
}

function removeItem(event) {
  var div = event.target.parentNode;
  var item = div.laptop;
  removeSideItem(item);
  document.getElementById('scratchpad').removeChild(div);
}
