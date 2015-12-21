/**
 * Created by Jason on 2015-12-19.
 */
function loadKmlLayer(src, map) {
    var kmlLayer = new google.maps.KmlLayer(src, {
        //suppressInfoWindows: true,
        preserveViewport: true,
        map: map
    });
    //google.maps.event.addListener(kmlLayer, 'click', function(event) {
    //  var content = event.featureData.infoWindowHtml;
    //  var testimonial = document.getElementById('capture');
    //  testimonial.innerHTML = content;
    //});
}

function loadProgressLine(map) {
    $.ajax({
        url: apiurl + "/Api/Points",
        type: "GET",
        dataType: "json",
        headers: headers,
        cache: false,
        success: function (data) {
            progressCoordinates = [];
            $.each(data, function (key, item) {
                var latlng = {lat: item.Lat, lng: item.Lng};
                progressCoordinates.push(latlng);
            });
            var progressPath = new google.maps.Polyline({
                path: progressCoordinates,
                geodesic: true,
                strokeColor: '#00FF00',
                strokeOpacity: 1.0,
                strokeWeight: 4
            });
            progressPath.setMap(map);
        },
        error: function (e) {
            alert("not good" + JSON.stringify(e));
        }
    });
    /*
     progressCoordinates = [
     {lng: 120.2031049251, lat: 31.5951298752},
     {lng: 120.2048203339, lat: 31.5955834663},
     {lng: 120.2048304023, lat: 31.5955861285},
     {lng: 120.2048404708, lat: 31.5955887906},
     {lng: 120.2048505394, lat: 31.5955914523},
     {lng: 120.2048606082, lat: 31.5955941134},
     ];

     var progressPath = new google.maps.Polyline({
     path: progressCoordinates,
     geodesic: true,
     strokeColor: '#FF0000',
     strokeOpacity: 1.0,
     strokeWeight: 4
     });
     */

}

function loadPlacemarks(map) {
    $.ajax({
        url: apiurl + "/Api/Tags",
        type: "GET",
        dataType: "json",
        headers: headers,
        //crossDomain: true,
        //data: "{}",
        cache: false,
        success: function (data) {
            $.each(data, function (key, item) {
                var latlng = {lat: item.Lat, lng: item.Lng};
                loadMarker(latlng, map, item.Id, item.Name, item.Comments);
            });
        },
        error: function (e) {
            alert("not good" + JSON.stringify(e));
        }
    });
}

function loadLineTask() {
    $.ajax({
        url: apiurl + "/Api/LineTasks/1",
        type: "GET",
        dataType: "json",
        headers: headers,
        //crossDomain: true,
        //data: "{}",
        cache: false,
        success: function (data) {
            $('#btnAdd').hide();
            LineTask = data;
            $('#FinishedDistance').val(data.FinishedDistance);
            $('#WorkDays').val(data.WorkDays);
        },
        error: function (e) {
            alert("not good" + JSON.stringify(e));
        }
    });
}

// loads a marker to the map.
function loadMarker(location, map, id, name, comments) {
    // load the marker from stored location, and add the information label
    // from the comment.
    var marker = new google.maps.Marker({
        position: location,
        label: name,
        title: comments,
        map: map
    });

    marker.set("id", id);

    var html = "<table id=" + id + ">" +
        "<tr><td>Name:</td> <td><input type='text' id='name' value='" + name + "'/></td> </tr>" +
        "<tr><td>Comments:</td> <td><input type='text' id='comments' value='" + comments + "'/></td> </tr>" +
        "<tr><td></td><td><input id='Save' type='button' value='Save & Close'/> <input id='Delete' type='button' value='Delete'/></td></tr>";

    marker.info = new google.maps.InfoWindow({
        content: html
    });

    google.maps.event.addListener(marker, 'click', function () {
        marker.info.open(map, marker);

        $("#" + id).find("#Save").click(function () {
            $("#" + id).find("#Save").unbind();
            UpdateMarker(marker, id);
        });

        $("#" + id).find("#Delete").click(function () {
            $("#" + id).find("#Delete").unbind();
            RemoveMarker(marker, id);
        });
    });

    markers.push(marker);
}

function addMarker(location, map) {
    // Add the marker at the clicked location, and add the next-available label
    // from the array of alphabetical characters.
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });

    var tagId = "T" + (tagIndex++).toString();// start with "T" means a temp Id for new tag by click

    marker.set("id", tagId);

    var html = "<table id='" + tagId + "'>" +
        "<tr><td>Name:</td> <td><input type='text' id='name'/> </td> </tr>" +
        "<tr><td>Comments:</td> <td><input type='text' id='comments'/></td> </tr>" +
            /*"<tr><td>Type:</td> <td><select id='type'>" +
             "<option value='start' SELECTED>start</option>" +
             "<option value='point'>point</option>" +
             "<option value='end'>end</option>" +
             "</select> </td></tr>" +*/
        "<tr><td></td><td><input id='Save' type='button' value='Save & Close'/> <input id='Delete' type='button' value='Delete'/></td></tr>";

    marker.info = new google.maps.InfoWindow({
        content: html
    });

    google.maps.event.addListener(marker, 'click', function () {
        marker.info.open(map, marker);

        $("#" + tagId).find("#Save").click(function () {
            $("#" + tagId).find("#Save").unbind();
            SaveMarker(marker, tagId);
        });

        $("#" + tagId).find("#Delete").click(function () {
            $("#" + tagId).find("#Delete").unbind();
            RemoveMarker(marker, tagId);
        });
    });

    markers.push(marker);

    google.maps.event.trigger(marker, "click");
}

function ReBindMarkerClick(marker, name, comments) {
    google.maps.event.clearListeners(marker, 'click');
    var tagId = marker.get("id");
    var html = "<table id=" + tagId + ">" +
        "<tr><td>Name:</td> <td><input type='text' id='name' value='" + name + "'/></td> </tr>" +
        "<tr><td>Comments:</td> <td><input type='text' id='comments' value='" + comments + "'/></td> </tr>" +
        "<tr><td></td><td><input id='Save' type='button' value='Save & Close'/> <input id='Delete' type='button' value='Delete'/></td></tr>";

    marker.info = new google.maps.InfoWindow({
        content: html
    });

    google.maps.event.addListener(marker, 'click', function () {
        marker.info.open(map, marker);
        $("#" + tagId).find("#Save").click(function () {
            $("#" + tagId).find("#Save").unbind();
            UpdateMarker(marker, tagId);
        });

        $("#" + tagId).find("#Delete").click(function () {
            $("#" + tagId).find("#Delete").unbind();
            RemoveMarker(marker, tagId);
        });
    });
}

function UpdateMarker(marker, tagId) {
    var info = $("#" + tagId);
    var latlng = marker.position;
    var tag = {
        Id: tagId,
        Name: info.find("#name").val(),
        Comments: info.find("#comments").val(),
        Lat: latlng.lat(),
        Lng: latlng.lng(),
        UserId: 0,
        CreateDate: "2015-11-29T11:06:37.763"
    };


    $.ajax({
        url: apiurl + '/Api/Tags/' + tagId,
        type: 'PUT',
        data: JSON.stringify(tag),
        contentType: 'application/json',
        headers: headers,
        success: function (data) {
            marker.setLabel(tag.Name);
            marker.setTitle(tag.Comments);
            marker.info.close();
        },
        error: function (e) {
            alert("not good" + JSON.stringify(e));
        }
    });
}

function SaveMarker(marker, tagId) {
    var id = marker.get("id");
    if (id != null && $.isNumeric(id)) {
        UpdateMarker(marker, id);
    }
    else {
        var info = $("#" + tagId);
        var latlng = marker.position;
        var tag = {
            Name: info.find("#name").val(),
            Comments: info.find("#comments").val(),
            Lat: latlng.lat(),
            Lng: latlng.lng(),
            CreateDate: '2015-12-02 20:15:00',
            UserId: 0
        };

        $.ajax({
            url: apiurl + '/Api/Tags',
            type: 'POST',
            data: JSON.stringify(tag),
            headers: headers,
            contentType: 'application/json',
            success: function (data) {
                marker.set("id", data.Id);
                marker.setLabel(tag.Name);
                marker.setTitle(tag.Comments);
                marker.info.close();
                ReBindMarkerClick(marker, tag.Name, tag.Comments);
                //infowindow.close();
            },
            error: function (e) {
                alert("not good" + JSON.stringify(e));
            }
        });
    }
}

function RemoveMarker(marker, tagId) {
    var id = marker.get("id");
    if (id == null) {
        id = tagId;
    }

    var idx = $.map(markers, function (obj, index) {
        if (obj.id == id) {
            return index;
        }
    })[0];

    marker.info.close();
    markers[idx].setMap(null);
    marker = null;

    if (id != null && $.isNumeric(id)) {
        $.ajax({
            url: apiurl + '/Api/Tags/' + id,
            type: 'DELETE',
            headers: headers,
            success: function (data) {
            },
            error: function (e) {
                alert("not good" + JSON.stringify(e));
            }
        });
    }
}

function addProgress() {
    var LineTask = {
        Id: 1,
        StartLat: 31.5951298752,
        StartLng: 120.2031049251,
        FinishedDistance: $("#FinishedDistance").val(),
        WorkDays: $("#WorkDays").val(),
        StartedOn: "2015-12-21T00:23:10.9941944+00:00",
        CreatedBy: 1,
        CreatedOn: "2015-12-21T00:23:10.9941944+00:00",
        ModifiedBy: 1,
        ModifiedOn: "2015-12-21T00:23:10.9941944+00:00"
    };

    $.ajax({
        url: apiurl + '/Api/LineTasks',
        type: 'POST',
        data: JSON.stringify(LineTask),
        headers: headers,
        contentType: 'application/json',
        success: function (data) {
            loadProgressLine(map);
        },
        error: function (e) {
            alert("not good" + JSON.stringify(e));
        }
    });
}

function saveProgress() {
    var LineTask = {
        Id: 1,
        StartLat: 31.5951298752,
        StartLng: 120.2031049251,
        FinishedDistance: $("#FinishedDistance").val(),
        WorkDays: $("#WorkDays").val(),
        StartedOn: "2015-12-21T00:23:10.9941944+00:00",
        CreatedBy: 1,
        CreatedOn: "2015-12-21T00:23:10.9941944+00:00",
        ModifiedBy: 1,
        ModifiedOn: "2015-12-21T00:23:10.9941944+00:00"
    };

    $.ajax({
        url: apiurl + '/Api/LineTasks/' + LineTask.Id,
        type: 'PUT',
        data: JSON.stringify(LineTask),
        headers: headers,
        contentType: 'application/json',
        success: function (data) {
            loadProgressLine(map);
        },
        error: function (e) {
            alert("not good" + JSON.stringify(e));
        }
    });
}

function reset() {
    map.setCenter(new google.maps.LatLng(31.546941, 120.331878));
    map.setZoom(12);
}

function logout() {
    sessionStorage.removeItem(tokenKey);
    window.location.href = "login.html";
}
