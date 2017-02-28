(function () {
    $(document).ready(function () {

        var filter = "Marker = 'placemark_circle' OR Marker = 'large_blue'";
        var map_and_layer = initialize(map, layer, filter);
        var map = map_and_layer['map'];
        var layer = map_and_layer['layer'];
//        var fullDatasetId = "1NVngiWyLZULKjvNpyDamWAj35Y2SQyIUZt1b-UYM"; //v1
        var fullDatasetId = "1TYUsV_PKpYdcNqZHchSVfC0p0Rw673FNKgx1GRxA"; //alternative
        
//        var namesOnlyId = "1DK0-Q0RT7XlDrPyPiwM8uQLlYFwsQs9_JkXcKc6u"; //v1
        var namesOnlyId = "1-bbXnnEvdA8Kqlr-rkxCw2Bs_pJb4wgQyYeUOCKF"; //v2

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
            $('.postcodeErrorMessage').addClass('notDisplayed');
            $('.nameErrorMessage').addClass('notDisplayed');
            $("#nameSearch").val("");
            displaySelectedMarkers();
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
                        $('.postcodeErrorMessage').removeClass('notDisplayed');
                    }
                },
                error: function () {
                    var latlng = postcodeLookupLocal(postcodeToTest);
                    if (latlng) {
                        updateMap(latlng);
                    } else {
                        $('.postcodeErrorMessage').removeClass('notDisplayed');
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

        function nameLookup() {
            var textValue = $('#nameSearch').val();
            var filter;
            if (textValue.length > 2) {
                filter = "Name CONTAINS IGNORING CASE '" + textValue.replace("'", "''") + "'";
                layer.setOptions({
                    query: {
                        select: "col4",
                        from: fullDatasetId,
                        where: filter
                    }
                });

                $.ajax({
                    url: encodeURI("https://www.googleapis.com/fusiontables/v2/query?sql=SELECT * FROM " + namesOnlyId + " WHERE " + filter + "&key=AIzaSyCBSSVwKewIscE22gLQqPxArKvBlxTqv3U"), 
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
                        if (suggestions.length === 0) {
                            $('.nameErrorMessage').removeClass('notDisplayed');
                        } else {
                            $('.nameErrorMessage').addClass('notDisplayed');
                            $("#nameSearch").autocomplete("option", "source", suggestions.sort(function (a, b) {
                                if (a.label.toLowerCase() < b.label.toLowerCase())
                                    return -1;
                                if (a.label.toLowerCase() > b.label.toLowerCase())
                                    return 1;
                                return 0;
                            }));
                        }
                    },
                    error: function () {
                        console.log('Erroneous');
                    }
                });
            }
        }

        $('#nameSubmit').on('click', function () {
            $('#postcode').val("");
            $('.postcodeErrorMessage').addClass('notDisplayed');
            nameLookup();
            $('#nameSearch').blur();
            return false;
        });

        $('#nameSearchForm').on('submit', function () {
            $('#postcode').val("");
            $('.postcodeErrorMessage').addClass('notDisplayed');
            nameLookup();
            $('#nameSearch').blur();
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

            var types = [];
            $('.nurseryType').each(function () {
                if (this.checked) {
                    types.push("'" + this.value + "'");
                }
            });
            filter += " AND 'Category' IN (" + types.join(',') + ")";

            layer.setOptions({
                query: {
                    select: "col4",
                    from: fullDatasetId,
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
            layer.setOptions({
                query: {
                    select: "col4",
                    from: fullDatasetId, 
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
                $('.postcodeErrorMessage').addClass('notDisplayed');
                filter = "Name CONTAINS IGNORING CASE '" + ui.item.value.replace("'", "''") + "'";
                layer.setOptions({
                    query: {
                        select: "col4",
                        from: fullDatasetId,
                        where: filter
                    }
                });
                $("#nameSearch").blur();
                $('#nameSearchForm').submit();
            }
        });

        $('#nameSearch').keyup(function (event) {
            nameLookup();
        });
    })
})();