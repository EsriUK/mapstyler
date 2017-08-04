require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Search",
    "dojo/domReady!"
], function(
    Map,
    MapView,
    Search) {

    var map = new Map({
        basemap: "dark-gray-vector"
    });

    var view = new MapView({
        container: "viewDiv",
        map: map,
        zoom: 13,
        center: [-0.010557, 51.495997]
    });

    var searchWidget = new Search({
        view: view
    });

    view.ui.add(searchWidget, {
        position: "top-left",
        index: 0
    });
});