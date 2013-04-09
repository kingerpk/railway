var LGis = {

    Init: function () {
        this.localhost = "http://localhost:8080/geoserver";
        this.remotehost = "http://58.215.188.217:8080/geoserver";
        this.host = this.remotehost;
        this.rUrl = "data/";
        this.resourceUrl = "http://58.215.188.217:8080/fileupload/receiveFile/";
        //this.resourceUrl = this.rUrl;
        this.haspInterval = ""; //haps图层切换器
        this.map = null;
        this.bounds = new OpenLayers.Bounds(
				109.3753351271, 19.76077990234,
				117.84957829116, 26.182667300106
			);
        this.InitParameter();
        this.InitMap();
        this.InitEvent();
    },
    InitEvent: function () {
        var me = this;
        me.InitHapsDataPanelEvent();
    },
    InitMap: function () {
        var me = this;
        me.InitMapBase();
        me.InitBaseLayer();
        me.InitRailwayLayer();
        me.InitHapsDataLayer();

        me.InitHapsDataPanel();//执行这个方法就展现haps
    },
    InitMapBase: function () {
        var me = this;
        var options = {
            projection: new OpenLayers.Projection("EPSG:4326"),
            units: "degrees",
            maxExtent: me.bounds,
            resolutions: [0.008275628089904775, 0.004137814044952387, 0.0020689070224761937, 0.0010344535112380968],
            restrictedExtent: me.bounds
        };

        $("#mapDiv").empty();
        //初始化地图对象
        me.map = new OpenLayers.Map("mapDiv", options);
    },
    InitBaseLayer: function () {
        var me = this;
        //加载底图图层
        var layer = new OpenLayers.Layer.WMS(
					"base_layer",
					me.host + "/cite/wms?service=WMS",
					 { layers: "basemap" },
					 { singleTile: true }
				);
        me.map.addLayers([layer]);
        me.map.setCenter(new OpenLayers.LonLat(113.62678, 23.44851), 0);
    },
    InitRailwayLayer: function () {
        var me = this;
        //加载铁路图层
        var layer = new OpenLayers.Layer.WMS(
					"railwayLayer",
					me.host + "/cite/wms?service=WMS",
					 { layers: "railway_g", transparent: true },
					 { singleTile: true }
				);
        layer.setZIndex(100)
        me.map.addLayers([layer]);
    },
    /*HaspData**************************************************************************************/
    InitHapsDataPanelEvent: function () {
        var me = this;

        $("#hapsDataPanel li").mouseenter(function () {
            $(this).addClass("hapsWarnTimeHover");
        });

        $("#hapsDataPanel li").mouseleave(function () {
            $(this).removeClass("hapsWarnTimeHover");
        });
        $("#hapsDataPanel li").click(function () {
            $("#hapsDataPanel li").removeClass("hapsWarnTimeSelect");
            $(this).addClass("hapsWarnTimeSelect");
            var tag = $(this).attr("tag");
            var hapsLayer = me.map.getLayersByName("haps_data_layer")[0];
            if (hapsLayer) {
                me.map.removeLayer(hapsLayer);
            }

            var newHapsLayer = me.GetLayerAjax(me.resourceUrl + "haspJson/HapsGeoJson" + tag + ".js", "haps_data_layer");
            newHapsLayer.styleMap = me.HapsDataLayerStyle;
            me.map.addLayers([newHapsLayer]);
            var control = me.map.getControlsBy("ControlId", "haps_selecter")[0];
            me.map.removeControl(control);
            me.InitHapsSelecter(true);
        });
        me.InitHapsSelecter(false);
    },
    InitHapsDataPanel: function () {
        var me = this;
        dataDate = dataDate + "";
        var year = dataDate.substr(0, 4);
        var month = dataDate.substr(4, 2);
        var day = dataDate.substr(6, 2);
        var hours = dataDate.substr(8, 2);
        var date = new Date();
        date.setYear(year);
        date.setMonth(Number(month));
        date.setDate(Number(day));
        date.setHours(Number(hours));
        for (var i = 0; i < 12; i++) {
            date.setHours(date.getHours() + 1);
            var btnTitle = date.getFullYear() + "年";
            btnTitle += date.getMonth() + "月";
            btnTitle += date.getDate() + "日";
            btnTitle += date.getHours() + "时";
            $("#hapsDataPanel li[tag='" + i + "']").html(btnTitle);
        }

        $.ajax(
					{
					    url: me.resourceUrl + "haspJson/hapsWarnTime.js",
					    dataType: "json",
					    success: function (d) {
					        for (var timeIndex in d) {
					            var valueRange = d[timeIndex];
					            var color = "beige";
					            if (valueRange == "1") {
					                color = "#00EBEB";
					            }
					            else if (valueRange == "5") {
					                color = "#019FF5";
					            }
					            else if (valueRange == "10") {
					                color = "#0000F6";
					            }
					            else if (valueRange == "15") {
					                color = "#00FF00";
					            }
					            else if (valueRange == "20") {
					                color = "#00C700";
					            }
					            else if (valueRange == "25") {
					                color = "#009000";
					            }
					            else if (valueRange == "30") {
					                color = "#FFFF00";
					            }
					            else if (valueRange == "31") {
					                color = "red";
					            }
					            $("#hapsDataPanel li[tag='" + timeIndex + "']").css("background-color", color);
					        }
					    }
					}
				);
	},
	InitHapsSelecter: function (activate) {
	    var me = this;
	    var hapsLayer = me.map.getLayersByName("haps_data_layer")[0];
	    var haspSelecter = new OpenLayers.Control.SelectFeature(
					hapsLayer,
					{
					    clickout: true,
					    hover: true,
					    onSelect: function (e) {
					        if (me.popup) {
					            me.map.removePopup(me.popup);
					        }
					        var values = (e.data.r + "").split(".");
					        var value = "";
					        if (values.length > 1) {
					            value = values[0] + "." + (values[1] + "00").substr(0, 2);
					        }
					        else {
					            value = values[0];
					        }

					        if ((e.data.r + "").indexOf("e") != -1) {
					            value = 0;
					        }

					        me.popup = new OpenLayers.Popup.FramedCloud(
								"",
								new OpenLayers.LonLat(e.geometry.getCentroid().x, e.geometry.getCentroid().y),
								new OpenLayers.Size(100, 100),
								"雨量：" + value,
								null,
								true,
								function () {
								    me.map.removePopup(me.popup);
								    haspSelecter.unselectAll();
								}
							);
					        me.map.addPopup(me.popup);
					    },
					    onUnselect: function () {
					        if (me.popup) {
					            me.map.removePopup(me.popup);
					        }
					    }
					}
			);
	    haspSelecter.ControlId = "haps_selecter";
	    me.map.addControl(haspSelecter);
	    haspSelecter.activate
	},
    InitHapsDataLayer: function () {
        var me = this;
        var HapsDataLayer = me.GetLayerAjax(me.resourceUrl + "haspJson/HapsGeoJson0.js", "haps_data_layer");
        HapsDataLayer.styleMap = me.HapsDataLayerStyle;
        HapsDataLayer.setVisibility(true);
        me.map.addLayers([HapsDataLayer]);
    },
    /*Common***********************************************************************************************************/
    GetLayerAjax: function (url, layerName) {
        var Layer = new OpenLayers.Layer.Vector(layerName);
        $.ajax(
					{
					    url: url,
					    dataType: "text",
					    success: function (d) {
					        var format = new OpenLayers.Format.GeoJSON();
					        var temFeatures = format.read(d);
					        try {
					            Layer.addFeatures(temFeatures);
					        }
					        catch (e) {
					            var i = 0;
					        }

					    }
					}
				);
        return Layer;
    },
    InitParameter: function () {
        this.HapsDataLayerStyle = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                fillColor: "#ffcc66",
                strokeColor: "white",
                strokeOpacity: 1,
                strokeWidth: 1.5,
                fillOpacity: 0.7,
                cursor: "pointer"
            },
								{
								    rules: [
										new OpenLayers.Rule({
										    filter: new OpenLayers.Filter.Comparison({
										        type: OpenLayers.Filter.Comparison.GREATER_THAN,
										        property: "r",
										        value: "30"
										    }),
										    symbolizer: {
										        fillColor: "red"
										    }
										}),
										new OpenLayers.Rule({
										    filter: new OpenLayers.Filter.Comparison({
										        type: OpenLayers.Filter.Comparison.BETWEEN,
										        property: "r",
										        lowerBoundary: 0.1,
										        upperBoundary: 1
										    }),
										    symbolizer: {
										        fillColor: "#00EBEB"
										    }
										}),
											new OpenLayers.Rule({
											    filter: new OpenLayers.Filter.Comparison({
											        type: OpenLayers.Filter.Comparison.BETWEEN,
											        property: "r",
											        lowerBoundary: 1,
											        upperBoundary: 5
											    }),
											    symbolizer: {
											        fillColor: "#019FF5"
											    }
											}),
											new OpenLayers.Rule({
											    filter: new OpenLayers.Filter.Comparison({
											        type: OpenLayers.Filter.Comparison.BETWEEN,
											        property: "r",
											        lowerBoundary: 5,
											        upperBoundary: 10
											    }),
											    symbolizer: {
											        fillColor: "#0000F6"
											    }
											}),
												new OpenLayers.Rule({
												    filter: new OpenLayers.Filter.Comparison({
												        type: OpenLayers.Filter.Comparison.BETWEEN,
												        property: "r",
												        lowerBoundary: 10,
												        upperBoundary: 15
												    }),
												    symbolizer: {
												        fillColor: "#00FF00"
												    }
												}),
												new OpenLayers.Rule({
												    filter: new OpenLayers.Filter.Comparison({
												        type: OpenLayers.Filter.Comparison.BETWEEN,
												        property: "r",
												        lowerBoundary: 15,
												        upperBoundary: 20
												    }),
												    symbolizer: {
												        fillColor: "#00C700"
												    }
												}),
												new OpenLayers.Rule({
												    filter: new OpenLayers.Filter.Comparison({
												        type: OpenLayers.Filter.Comparison.BETWEEN,
												        property: "r",
												        lowerBoundary: 20,
												        upperBoundary: 25
												    }),
												    symbolizer: {
												        fillColor: "#009000"
												    }
												}),
												new OpenLayers.Rule({
												    filter: new OpenLayers.Filter.Comparison({
												        type: OpenLayers.Filter.Comparison.BETWEEN,
												        property: "r",
												        lowerBoundary: 25,
												        upperBoundary: 30
												    }),
												    symbolizer: {
												        fillColor: "#FFFF00"
												    }
												}),
										new OpenLayers.Rule({
										    elseFilter: true,
										    symbolizer: {
										        fillColor: "#ffcc66",
										        strokeColor: "white",
										        strokeOpacity: 1,
										        strokeWidth: 0.3,
										        fillOpacity: 0.7
										    }
										})
									]
								}
							)
        });
    }
};
	
			
	$(document).ready(
		function(){
			LGis.Init();
		}
	)
