function initialize(map, layer, filterWhere) {
  console.log(filterWhere); 
    google.maps.visualRefresh = true;
    var isMobile = (navigator.userAgent.toLowerCase().indexOf('android') > -1) ||
      (navigator.userAgent.match(/(iPod|iPhone|iPad|BlackBerry|Windows Phone|iemobile)/));
//    if (isMobile) {
//      var viewport = document.querySelector("meta[name=viewport]");
//      viewport.setAttribute('content', 'initial-scale=1.0, user-scalable=no');
//    }
    var mapDiv = document.getElementById('googft-mapCanvas');
    mapDiv.style.width = isMobile ? '85%' : '700px';
    mapDiv.style.height = isMobile ? '360px' : '500px';
//    if (isMobile) {
//      var container = document.getElementsByClassName("container")[0];
//      container.style.width = '100%'; 
//    }; 
    map = new google.maps.Map(mapDiv, {
      center: new google.maps.LatLng(52.2, -1.6),
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('googft-legend-open'));
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('googft-legend'));

    layer = new google.maps.FusionTablesLayer({
      map: map,
      heatmap: { enabled: false },
      query: {
        select: "col4",
        from: "1NVngiWyLZULKjvNpyDamWAj35Y2SQyIUZt1b-UYM",
        where: filterWhere
      },
      options: {
        styleId: 2,
        templateId: 2
      }
    });

    // if (isMobile) {
    //   var legend = document.getElementById('googft-legend');
    //   var legendOpenButton = document.getElementById('googft-legend-open');
    //   var legendCloseButton = document.getElementById('googft-legend-close');
    //   legend.style.display = 'none';
    //   legendOpenButton.style.display = 'block';
    //   legendCloseButton.style.display = 'block';
    //   legendOpenButton.onclick = function() {
    //     legend.style.display = 'block';
    //     legendOpenButton.style.display = 'none';
    //   }
    //   legendCloseButton.onclick = function() {
    //     legend.style.display = 'none';
    //     legendOpenButton.style.display = 'block';
    //   }
    // }
    return {
      'map': map, 
      'layer': layer
    }; 
  }

  // google.maps.event.addDomListener(window, 'load', initialize);