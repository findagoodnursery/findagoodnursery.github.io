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

        function updateMap(latLng) {
            $('.errorMessage').addClass('notDisplayed');
            displaySelectedMarkers();
            $('#postcode').blur();
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
                        updateMap(latLng); 
                    } else {
                        $('.errorMessage').removeClass('notDisplayed');
                    }
                },
                error: function () {
                    var latlng = postcodeLookupLocal(postcodeToTest);
                    if (latlng) {
                        updateMap(latLng);
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
                    from: "1NVngiWyLZULKjvNpyDamWAj35Y2SQyIUZt1b-UYM",
                    where: filter
                }
            });
        }

        $('#filters').on('change', function () {
            displaySelectedMarkers();
        });

        $("#nameSearch").autocomplete({
            minLength: 3,
            select: function (event, ui) {
                console.log(ui.item.latLng);
                $("#nameSearch").blur();
                map.panTo(new google.maps.LatLng(ui.item.latLng[0], ui.item.latLng[1]));
                map.setZoom(14);
                $('#postcode').val("");
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
                        from: "1NVngiWyLZULKjvNpyDamWAj35Y2SQyIUZt1b-UYM",
                        where: filter
                    }
                });

                $.ajax({
                    url: encodeURI("https://www.googleapis.com/fusiontables/v2/query?sql=SELECT * FROM 1DK0-Q0RT7XlDrPyPiwM8uQLlYFwsQs9_JkXcKc6u WHERE " + filter + "&key=AIzaSyCBSSVwKewIscE22gLQqPxArKvBlxTqv3U"),
                    success: function (result) {
                        var suggestions = [];
                        $.each(result.rows, function (index, value) {
                            if (value[0].toLowerCase().indexOf(textValue.toLowerCase()) === 0) {
                                suggestions.push({
                                    'label': value[0],
                                    'value': value[0],
                                    'latLng': [value[1], value[2]]
                                });
                            }
                        });
                        console.log(suggestions);
                        $("#nameSearch").autocomplete("option", "source", suggestions);
                    },
                    error: function () {
                        console.log('Erroneous');
                    }
                });


            }

        });
    })
})();