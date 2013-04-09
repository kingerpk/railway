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

        me.InitTaiFengEvent();
        me.InitMonitorEvent();
        me.BindWeathWarnPlanEven();
        me.InitHapsDataPanelEvent();
        me.InitHapsImageEvent();
    },
    InitMap: function () {
        var me = this;
        me.InitMapBase();
        me.InitBaseLayer();
        me.InitRailwayLayer();

        me.InitMonitorLayer();
        me.InitHapsDataLayer();
        me.InitWeatherWarnLayer();
        me.InitHapsImageLayer();

        me.SetLayerVisibleAllForSingle("monitor_layer", true);
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
        me.RegisterBaseLayer(layer, "railwayLayer");
        me.map.addLayers([layer]);
    },
    /*>>>TaiFeng<<<*********************************************************************/
    ShowTaiFeng: function (showtaifeng) {
        if (showtaifeng) {
            $("#mapDiv").hide();
            $("#taifeng_context").show();
        }
        else {
            $("#mapDiv").show();
            $("#taifeng_context").hide();
        }
    },
    InitTaiFengEvent: function () {
        var me = this;
        $("#taifeng_a").bind("click", function () {
            me.ShowTaiFeng(true);
            me.ShowSubMenu("none");
            me.SetControlActivateAllForSingle("none");
        });
    },
    /*Montitor**************************************************************************************/
    InitMonitorLayer: function () {
        var me = this;
        var MonitorLayer = me.GetLayerAjax(me.resourceUrl + "monitorJson/montiorGeoJson.json?"+me.GetRandom(), "monitor_layer");
        MonitorLayer.styleMap = me.MonitorLayerStyle;
        MonitorLayer.setVisibility(false);
        me.map.addLayers([MonitorLayer]);
        var MonitorFieldSelectPantl = new OpenLayers.Control.Panel({
            createControlMarkup: function () {
                var myControl = "<ul id='MonitorFieldSelectPantl'>";
                myControl += '<li id="ws_li">风速</li>';
                myControl += '<li id="wd_li">风向</li>';
                myControl += '<li id="t_li">温度</li>';
                myControl += '<li id="r_li">雨量</li>';
                myControl += '</ul>';
                return $(myControl)[0];
            }
        });
        MonitorFieldSelectPantl.addControls([new OpenLayers.Control.Button()]);
        me.RegisterLonelyControl(MonitorFieldSelectPantl, "MonitorFieldSelectPantl", true);
    },
    ShowMonitorLabel: function (field) {
        var me = this;
        me.SetLayerVisibleAllForSingle("monitor_layer", true);
        me.ShowSubMenu("none");
        var MonitorLayer = me.map.getLayersByName("monitor_layer")[0];
        MonitorLayer.styleMap.styles["default"].defaultStyle.label = '${' + field + '}';
        MonitorLayer.redraw();
        me.SetControlActivateAllForSingle("none");
    },
    InitMonitorEvent: function () {
        var me = this;
        $("#monitor_li").bind("click", function () {
            me.ShowTaiFeng(false);
            me.ShowMonitorLabel("r05m");
            me.SetControlActivateAllForSingle("MonitorFieldSelectPantl");
        });
        $("#wd_li").bind("click", function () {
            me.ShowTaiFeng(false);
            $("#monitorUL a").text("风向");
            me.ShowMonitorLabel("wd");
            me.SetControlActivateAllForSingle("MonitorFieldSelectPantl");
        });
        $("#ws_li").bind("click", function () {
            me.ShowTaiFeng(false);
            $("#monitorUL a").text("风速");
            me.ShowMonitorLabel("ws");
            me.SetControlActivateAllForSingle("MonitorFieldSelectPantl");
        });
        $("#t_li").bind("click", function () {
            me.ShowTaiFeng(false);
            $("#monitorUL a").text("温度");
            me.ShowMonitorLabel("t");
            me.SetControlActivateAllForSingle("MonitorFieldSelectPantl");
        });
        $("#r_li").bind("click", function () {
            me.ShowTaiFeng(false);
            $("#monitorUL a").text("雨量");
            me.ShowMonitorLabel("r05m");
            me.SetControlActivateAllForSingle("MonitorFieldSelectPantl");
        });
    },
    /*HapsImage*****************************************************************************/
    InitHapsImageLayer: function () {
        var me = this;
        var haspImageLayer = new OpenLayers.Layer.Image(
									"haps_image_layer",
									me.GetHaspBaseUrl() + "/0.gif",
									new OpenLayers.Bounds(104.0951, 17.234114484031, 120.78096004728, 30.269942645969),
									new OpenLayers.Size(1074, 800),
									{
									    isBaseLayer: false,
									    maxResolution: 0.06896066511648435,
									    minResolution: 0.0001346887990556335
									}
							);
        haspImageLayer.setVisibility(false);
        me.map.addLayers([haspImageLayer]);

        var haspTitlePanel = new OpenLayers.Control.Panel({
            createControlMarkup: function () {
                var myControl = "<h2 id='haspTitle' style='margin-top:20px;margin-left:600px'></h2>";
                return $(myControl)[0];
            }
        });
        var haspLengthPantl = new OpenLayers.Control.Panel({
            createControlMarkup: function () {
                var myControl = "<img id='hapsLength' style='display:none;margin-left: 740;margin-top: 50;' src='images/hapslegend.png'></img>";
                return $(myControl)[0];
            }
        });
        haspLengthPantl.addControls([new OpenLayers.Control.Button()]);
        me.map.addControls([haspLengthPantl]);
        haspTitlePanel.addControls([new OpenLayers.Control.Button()]);
        me.RegisterLonelyControl(haspTitlePanel, "hasp_title_panel");
    },
    InitHapsImageEvent: function () {
        var me = this;
        $("#hapsImage_a").bind("click", function () {
            me.ShowTaiFeng(false);
            me.ShowSubMenu("none");
            me.SetControlActivateAllForSingle("hasp_title_panel");
            me.SetLayerVisibleAllForSingle("haps_image_layer", true);

            var railwayLayer = me.map.getLayersByName("railwayLayer")[0];
            var index = railwayLayer.getZIndex();
            var hapsDataDateList=me.GetHapsDataDateList();

            $("#hapsLength").show();

            clearInterval(me.haspInterval);
            var haspImgIndex = 0;
            var hapsImageLayer = me.map.getLayersByName("haps_image_layer")[0];
            hapsImageLayer.setZIndex(index - 1);

            me.haspInterval = setInterval(
						function () {						    
						    var Title = hapsDataDateList[haspImgIndex];
						    $("#haspTitle").text(Title);
						    hapsImageLayer.setUrl(me.GetHaspBaseUrl() + "/" + haspImgIndex + ".gif");
						    haspImgIndex++;
						    if (haspImgIndex >= 12) {
						        haspImgIndex = 0;
						    }
						}
						, 1000
					)
        }
			)
    },
    GetHaspBaseUrl: function () {
        var d = new Date();
        d.setMonth(d.getMonth() + 1);
        d.setHours(d.getHours() - 1);
        var year = d.getFullYear() + "";
        var day = d.getDate() + "";
        var month = d.getMonth();
        var hours = (d.getHours() + "").substr(0, 2);
        if (month < 10) {
            month = "0" + month;
        }

        if (day < 10) {
            day = "0" + day;
        }

        if (hours < 10) {
            hours = "0" + hours;
        }

        var date = year + month + day;
        var url = this.resourceUrl + "/img/" + date + "/" + hours;
        return url;
    },
    /*HaspData**************************************************************************************/
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
					            value = values[0] + "." + (values[1] + "0000000").substr(0, 2);
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
        me.RegisterLonelyControl(haspSelecter, "haps_selecter", activate);
    },
    InitHapsDataPanelEvent: function () {
        var me = this;

        $("#hapsdata_a").bind("click", function () {
            me.ShowTaiFeng(false);
            me.ShowSubMenu("hapsDataPanel");
            me.SetLayerVisibleAllForSingle("haps_data_layer", true);
            me.SetControlActivateAllForSingle("haps_selecter");
            me.InitHapsDataPanel();
            $("#haspTitle").html("");
        });
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

            var newHapsLayer = me.GetLayerAjax(me.resourceUrl + "haspJson/HapsGeoJson" + tag + ".json?"+me.GetRandom(), "haps_data_layer");
            newHapsLayer.styleMap = me.HapsDataLayerStyle;
            me.map.addLayers([newHapsLayer]);
            var control = me.map.getControlsBy("ControlId", "haps_selecter")[0];
            me.map.removeControl(control);
            me.InitHapsSelecter(true);
        });
        me.InitHapsSelecter(false);
    },
    GetHapsDataDateList:function(){
        var me=this;
        var hapsDataDateList;
        $.ajax(
          {
            url:me.resourceUrl+"/haspJson/HapsdataDateList.json?"+me.GetRandom(),
            dataType:"json",
            async:false,
            success:function(d){
              hapsDataDateList=d;
            }
          }
        );
        return hapsDataDateList;
    },
    InitHapsDataPanel: function () {
        var me = this;        
        var hapsDataDateList=me.GetHapsDataDateList();
       
        for (var i = 0; i < 12; i++) {            
            $("#hapsDataPanel li[tag='" + i + "']").html(hapsDataDateList[i]);
        }

        $.ajax(
					{
					    url: me.resourceUrl + "haspJson/hapsWarnTime.json?"+me.GetRandom(),
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
    InitHapsDataLayer: function () {
        var me = this;
        var HapsDataLayer = me.GetLayerAjax(me.resourceUrl + "haspJson/HapsGeoJson0.json?"+me.GetRandom(), "haps_data_layer");
        HapsDataLayer.styleMap = me.HapsDataLayerStyle;
        HapsDataLayer.setVisibility(false);
        me.map.addLayers([HapsDataLayer]);
    },
    /*WeatherWarn************************************************************************************************/
    InitWeatherWarnLayer: function () {
        var me = this;
        var warnMakerLayer=new OpenLayers.Layer.Markers("weather_warn_layer");
        warnMakerLayer.setVisibility(false);
        me.map.addLayers([warnMakerLayer]);
    },
    BindWeathWarnPlanEven: function () {
        var me = this;

        $("#weatherWarn").bind("click", function () {
            me.ShowTaiFeng(false);
            me.SetLayerVisibleAllForSingle("weather_warn_layer",true);
            me.SetControlActivateAllForSingle("none");
            me.ShowWran("none");
        });    
    },
    ShowWran:function(){
        var me=this;
        var warnGeoJson=null;
        var warnMakerLayer=me.map.getLayersByName("weather_warn_layer")[0];
        warnMakerLayer.clearMarkers();
        $.ajax(
            {
                url:"data/weatherWarnGeoJson.json?"+me.GetRandom(),
                dataType:"json",
                async:false,
                success:function(d){
                    warnGeoJson=d;
                }
            }
        );

        $.ajax(
            {
                url:me.resourceUrl+"/monitorJson/WeatherWarn.json?"+me.GetRandom(),
                dataType:"json",
                success:function(d){                    
                    for(var city in d){                       
                        for(var i=0;i<warnGeoJson.features.length;i++){
                            var feature=warnGeoJson.features[i];
                            if(feature.properties.city==city){
                                var coordinates=feature.geometry.coordinates;
                                var signs=d[city];
                                var warnCount=0;
                                for(var sign in signs){
                                    var color=signs[sign];
                                    if(color=="0"){
                                        continue;
                                    }                                    
                                    var size = new OpenLayers.Size(30,30);
                                    var offset = new OpenLayers.Pixel(30*warnCount,0);
                                    var icon = new OpenLayers.Icon('images/yujing/'+sign+"_"+color+".gif", size, offset);
                                    warnMakerLayer.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(coordinates[0],coordinates[1]),icon));
                                    warnCount=warnCount+1;
                                }
                            }
                        }
                    }
                }
            }
        );
    },
    /*Common***********************************************************************************************************/
    ShowSubMenu: function (menuId) {
        $("div.submenuItem").hide();
        $("#" + menuId).show();
    },
    RegisterLonelyControl: function (Control, ControlId, activate) {
        var me = this;
        Control.ControlId = ControlId;
        me.map.addControl(Control);
        if (!me.lonelyControls) {
            me.lonelyControls = {};
        }
        me.lonelyControls[ControlId] = 1;
        $("#" + ControlId).hide();
        if (activate) {
            me.SetControlActivateAllForSingle(ControlId);
        }
    },
    RegisterBaseLayer: function (layer, layerName) {
        var me = this;
        layer.setName(layerName);
        me.map.addLayers([layer]);
        if (!me.BaseLayers) {
            me.BaseLayers = {};
        }
        me.BaseLayers[layerName] = 1;
    },
    SetControlActivateAllForSingle: function (ControlId) {
        var me = this;
        if (me.lonelyControls) {
            for (var id in me.lonelyControls) {
                var control = me.map.getControlsBy("ControlId", id)[0];
                control.deactivate();
                $("#" + id).hide();
            }
            var targetControl = me.map.getControlsBy("ControlId", ControlId)[0];
            if (targetControl) {
                targetControl.activate();
            }
            $("#" + ControlId).show();
        }
    },
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
    SetLayerVisibleAllForSingle: function (layerName, visable) {
        var me = this;
        var layers = me.map.layers;
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (layer.isBaseLayer) {
                continue;
            }

            if (me.BaseLayers) {
                if (me.BaseLayers[layer.name]) {
                    continue;
                }
            }

            if (layer.name == layerName) {
                layer.setVisibility(visable);
                if (layerName != "haps_image_layer") {
                    clearInterval(me.haspInterval);
                    $("#hapsLength").hide();
                }
                continue;
            }
            layer.setVisibility(!visable);
        }
    },
    ShowLayer: function (layerName) {
        var me = this;
        var layer = me.map.getLayersByName(layerName)[0];
        layer.setVisibility(true);
    },
    GetLayerVisible: function (layerName) {
        var me = this;
        var layer = me.map.getLayersByName(layerName);
        if (layer.length < 1) {
            return null;
        }
        else {
            return layer[0].getVisibility();
        }
    },
    GetRandom:function(){
        return (new Date()).getTime()+Math.random();
    },
    InitParameter: function () {

        this.MonitorLayerStyle = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                pointRadius: 2,
                fillColor: "#ff9933",
                strokeColor: "white",
                strokeWidth: 1,
                label: '${r05m}',
                labelXOffset: "-15",
                labelYOffset: "15"
            },
						{
						    rules: [
								new OpenLayers.Rule({
								    filter: new OpenLayers.Filter.Comparison({
								        type: OpenLayers.Filter.Comparison.GREATER_THAN,
								        property: "r05m",
								        value: 30
								    }),
								    symbolizer: {
								        graphicWidth: 20,
								        graphicHeight: 20,
								        externalGraphic: "images/Warning.gif",
								        label: '${r05m}',
								        labelXOffset: "-15",
								        labelYOffset: "15"
								    }
								}),
								new OpenLayers.Rule({
								    // apply this rule if no others apply
								    elseFilter: true,
								    symbolizer: {
								        pointRadius: 2,
								        fillColor: "#ff9933",
								        strokeColor: "white",
								        strokeWidth: 1
								    }
								})
							]
						}
					)
        });
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
