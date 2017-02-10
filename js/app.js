(function () {
    $(document).ready(function () {

        var map;
        var layer;
        var filter = "Marker = 'placemark_circle' OR Marker = 'large_blue'";
        map_and_layer = initialize(map, layer, filter);
        map = map_and_layer['map'];
        layer = map_and_layer['layer'];

        var postcodeLookupLocal = function (postcodeToTest) {
            if (postcodeToTest in postcodes) {
                return postcodes[postcodeToTest];
            } else {
                if (postcodeToTest.length > 3) {
                    postcodePart = postcodeToTest.substring(0, 4);
                    if (postcodePart in postcodes) {
                        return postcodes[postcodePart];
                    }
                }
                if (postcodeToTest.length > 2) {
                    postcodePart = postcodeToTest.substring(0, 3);
                    if (postcodePart in postcodes) {
                        return postcodes[postcodePart];
                    }
                }
                if (postcodeToTest.length > 1) {
                    postcodePart = postcodeToTest.substring(0, 2);
                    if (postcodePart in postcodes) {
                        return postcodes[postcodePart];
                    }
                }
            }
        };

        function updateMap(latlng) {
            $('.errorMessage').addClass('notDisplayed');
            displaySelectedMarkers();
            $("#nameSearch").val("");
            map.panTo(new google.maps.LatLng(latlng[0], latlng[1]));
            map.setZoom(14);
        };

        function postcodeLookupGeneral() {
            postcodeToTest = $.trim($('#postcode').val().toUpperCase());
            $.ajax({
                url: "https://api.postcodes.io/postcodes/" + postcodeToTest.replace(" ", ""),
                success: function (result) {
                    if (result.status === 200 && result.hasOwnProperty('result') && result.result.hasOwnProperty('latitude')) {
                        var latlng = [result.result.latitude, result.result.longitude];
                        updateMap(latlng);
                    } else {
                        $('.errorMessage').removeClass('notDisplayed');
                    }
                },
                error: function () {
                    var latlng = postcodeLookupLocal(postcodeToTest);
                    if (latlng) {
                        updateMap(latlng);
                    } else {
                        $('.errorMessage').removeClass('notDisplayed');
                    }
                }
            });
        }

        $('#postcode').keyup(function (event) {
            if (event.keyCode === 32) {
                postcodeLookupGeneral();
            }
        });

        $('#postcodeSubmit').on('click', function () {
            postcodeLookupGeneral();
            $('#postcode').blur();
            return false;
        });

        function displaySelectedMarkers() {
            var markers = [];
            $('.nurseryRating').each(function () {
                if (this.checked) {
                    markers.push("'" + this.value + "'");
                }
            });
            filter = "'Marker' IN (" + markers.join(',') + ")";
            layer.setOptions({
                query: {
                    select: "col4",
                    from: "1TYUsV_PKpYdcNqZHchSVfC0p0Rw673FNKgx1GRxA", //full set
                    where: filter
                }
            });
        }

        function displaySelectedTypes() {
            var types = [];
            $('.nurseryType').each(function () {
                if (this.checked) {
                    types.push("'" + this.value + "'");
                }
            });
            filter = "'Category' IN (" + types.join(',') + ")";
            console.log(filter);
            layer.setOptions({
                query: {
                    select: "col4",
                    from: "1TYUsV_PKpYdcNqZHchSVfC0p0Rw673FNKgx1GRxA", //full set
                    where: filter
                }
            });
        }

        $('#googft-mapCanvas').on('click', function () {
            $('input:focus').blur();
        });

        $('#typeFilters').on('change', function () {
            displaySelectedTypes();
        });

        $('#filters').on('change', function () {
            displaySelectedMarkers();
        });

        $("#nameSearch").autocomplete({
            minLength: 3,
            select: function (event, ui) {
                map.panTo(new google.maps.LatLng(ui.item.latLng[0], ui.item.latLng[1]));
                map.setZoom(14);
                $('#postcode').val("");
                console.log(ui.item.value);
                filter = "Name CONTAINS IGNORING CASE '" + ui.item.value.replace("'", "''") + "'";
                layer.setOptions({
                    query: {
                        select: "col4",
                        from: "1TYUsV_PKpYdcNqZHchSVfC0p0Rw673FNKgx1GRxA", //full set
                        where: filter
                    }
                });
            }
        });

        $('#nameSearch').keyup(function (event) {
            var results = [];
            var textValue = $('#nameSearch').val();
            console.log(textValue);
            var filter;
            if (textValue.length > 2) {
                filter = "Name CONTAINS IGNORING CASE '" + textValue.replace("'", "''") + "'";
                layer.setOptions({
                    query: {
                        select: "col4",
                        from: "1TYUsV_PKpYdcNqZHchSVfC0p0Rw673FNKgx1GRxA", //full set
                        where: filter
                    }
                });

                $.ajax({
                    url: encodeURI("https://www.googleapis.com/fusiontables/v2/query?sql=SELECT * FROM 1-bbXnnEvdA8Kqlr-rkxCw2Bs_pJb4wgQyYeUOCKF WHERE " + filter + "&key=AIzaSyCBSSVwKewIscE22gLQqPxArKvBlxTqv3U"), //names only
                    success: function (result) {
                        var suggestions = [];
                        $.each(result.rows, function (index, value) {
                            if (value[0].toLowerCase().indexOf(textValue.toLowerCase()) === 0) {
                                suggestions.push({
                                    'label': value[0] + ", " + value[1],
                                    'value': value[0],
                                    'latLng': [value[2], value[3]]
                                });
                            }
                        });
                        console.log(suggestions);
                        $("#nameSearch").autocomplete("option", "source", suggestions.sort(function (a, b) {
                            if (a.label.toLowerCase() < b.label.toLowerCase())
                                return -1;
                            if (a.label.toLowerCase() > b.label.toLowerCase())
                                return 1;
                            return 0;
                        }));
                    },
                    error: function () {
                        console.log('Erroneous');
                    }
                });


            }

        });
    })
})();