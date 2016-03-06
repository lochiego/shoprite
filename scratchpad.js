function dragItem(event) {
  event.dataTransfer.setData("item-index",event.target.data(product-index));
}

function allowDrop(ev) {
  ev.preventDefault();
}

function dropItem(ev) {
  ev.preventDefault();
  var itemIndex = ev.dataTransfer.getData("item-index");
  var item = filtered_items[itemIndex];
  ev.target.appendChild(sidebarVersion(item));
}

function sidebarVersion(laptop) {
  return "<div class='sidear-item-node><img src="+laptop.imageUrl+" alt="+laptop.laptopTitle()+"></div>";
}
