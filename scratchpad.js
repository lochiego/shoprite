function dragItem(event) {
  event.dataTransfer.setData("item-index",event.target.getAttribute('data-product-index'));
}

function allowDrop(ev) {
  ev.preventDefault();
}

var sidebarItems = new Set();

function dropItem(ev) {
  ev.preventDefault();
  var itemIndex = ev.dataTransfer.getData("item-index");
  var item = filtered_items[itemIndex];
  if (!sidebarItems.has(item)) {
    sidebarItems.add(item);
    document.getElementById('scratchpad').appendChild(sidebarVersion(item));
  }
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
  sidebarItems.delete(item);
  document.getElementById('scratchpad').removeChild(div);
}
