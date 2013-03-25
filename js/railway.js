	var LGis={
	
		Init:function()
		{		
			this.localhost="http://localhost:8080/geoserver";
			this.remotehost="http://58.215.188.217:8080/geoserver";
			this.host=this.remotehost;
			this.map=null;
			this.bounds = new OpenLayers.Bounds(
				109.3753351271,19.76077990234,
				117.84957829116,26.182667300106
			);
			this.InitParameter();
			this.InitMap();
			this.InitEvent();
		},
		InitEvent:function(){
			var me=this;	
			me.InitMonitorEvent();
			me.BindWeathWarnPlanEven();
			me.InitHapsDataPanelEvent();			
		},
		InitMap:function()
		{
			var me=this;
			me.InitMapBase();
			me.InitBaseLayer();
			me.InitMonitorLayer();
			me.InitHapsDataLayer();
			me.InitWeatherWarnLayer();
			me.SetLayerVisibleAllForSingle("monitor_layer",true);
		},
		InitMapBase:function()
		{
			var me=this;
			var options = {
							projection: new OpenLayers.Projection("EPSG:4326"),
							units: "degrees",
							//numZoomLevels: 15, 
							maxExtent:me.bounds,							
							resolutions:[0.008275628089904775,0.004137814044952387,0.0020689070224761937,0.0010344535112380968],
							restrictedExtent:me.bounds
						};
						
			$("#mapDiv").empty();
			//初始化地图对象
			me.map = new OpenLayers.Map("mapDiv",options);
		},
		InitBaseLayer:function()
		{
			var me=this;
			//加载底图图层
			var layer = new OpenLayers.Layer.WMS(
					"base_layer",
					me.host+"/cite/wms?service=WMS",
					 {layers: "railway1"},
					 {singleTile:true}
				);
			me.map.addLayers([layer]);
			me.map.setCenter(new OpenLayers.LonLat(113.62678, 23.44851), 0);
		},
		InitMonitorLayer:function(){
			var me=this;
			var MonitorLayer=me.GetLayerAjax("data/montiorGeoJson.js","monitor_layer");			
			MonitorLayer.styleMap=me.MonitorLayerStyle;
			MonitorLayer.setVisibility(false);
			me.map.addLayers([MonitorLayer]);
		},
		ShowMonitorLabel:function(field){
			var me=this;
			me.SetLayerVisibleAllForSingle("monitor_layer",true);
			me.ShowSubMenu("none");
			var MonitorLayer=me.map.getLayersByName("monitor_layer")[0];
			MonitorLayer.styleMap.styles["default"].defaultStyle.label='${'+field+'}';
			MonitorLayer.redraw();
			me.SetControlActivateAllForSingle("none");
		},
		InitMonitorEvent:function(){
			var me=this;
			$("#wd_li").bind("click",function(){
					$("#monitorUL a").text("风向");
					me.ShowMonitorLabel("wd");
			});
			$("#ws_li").bind("click",function(){
					$("#monitorUL a").text("风速");
					me.ShowMonitorLabel("ws");
			});
			$("#t_li").bind("click",function(){
					$("#monitorUL a").text("温度");
					me.ShowMonitorLabel("t");
			});
		},
		ShowSubMenu:function(menuId){
			$("div.submenuItem").hide();
			$("#"+menuId).show();
		},
		InitWeatherWarnLayer:function(){
			var me=this;
			var WeatherWarnLayer=me.GetLayerAjax("data/weatherWarnGeoJson.js","weather_warn_layer");
			WeatherWarnLayer.styleMap=me.WeatherWarnLayerStyle;	
			WeatherWarnLayer.setVisibility(false);
			me.map.addLayers([WeatherWarnLayer]);
		},
		BindWeathWarnPlanEven:function(){
			var me=this;

			$("#weatherWarn").bind("click",function(){				
				me.SetLayerVisibleAllForSingle("weather_warn_layer",true);
				me.ShowSubMenu("weatherWarnPanel");				
				me.SetControlActivateAllForSingle("none");
			});

			$("#MyMapPanel li").bind("click",function(){
				var sign=$(this).attr("tag");
				
				$.ajax(
					{
						url:"data/WeatherWarn.js",
						dataType:"json",
						success:function(d){
							var cityColor=d[sign];
							var layer=me.map.getLayersByName("weather_warn_layer")[0];
							var features=layer.features;
							for(var i in features){
								var feature=features[i];
								feature.attributes.color=0;
								feature.data.color=0;
							}
							if(typeof(cityColor)!="undefined"||cityColor!=null){
								for(var city in cityColor){
										var features=layer.getFeaturesByAttribute("NAME",city);
										if(features.length>0){
											var color=cityColor[city];
											var feature=features[0];
											feature.attributes.color=color;
											feature.data.color=color;
										}
								}
							}
							layer.redraw();							
						}
					}
				);
			});
		},
		InitHapsSelecter:function(activate){
			var me=this;
			var hapsLayer=me.map.getLayersByName("haps_data_layer")[0];
			var haspSelecter=new OpenLayers.Control.SelectFeature(								
					hapsLayer,
					{
						clickout:true,
						onSelect:function(e){
							if(me.popup){												
								me.map.removePopup(me.popup);
							}
							var value=e.data.r;
							
							me.popup=new OpenLayers.Popup.FramedCloud(
								"",
								new  OpenLayers.LonLat(e.geometry.getCentroid().x,e.geometry.getCentroid().y),
								new OpenLayers.Size(100,100),
								"雨量："+value,
								null,
								true,
								function(){
									me.map.removePopup(me.popup);
									haspSelecter.unselectAll();
								}
							);	
							me.map.addPopup(me.popup);
						}
					}
			);
			haspSelecter.ControlId="haps_selecter";
			me.RegisterLonelyControl(haspSelecter,"haps_selecter",activate);
		},
		RegisterLonelyControl:function(Control,ControlId,activate){
			var me=this;
			Control.ControlId=ControlId;
			me.map.addControl(Control);
			if(!me.lonelyControls){
				me.lonelyControls={};
			}
			me.lonelyControls[ControlId]=1;
			if(activate){
				me.SetControlActivateAllForSingle("haps_selecter");
			}
		},
		SetControlActivateAllForSingle:function(ControlId){
			var me=this;
			if(me.lonelyControls){
				for(var id in me.RegisterLonelyControl){
					var control=me.map.getControlsBy("ControlId",id)[0];
					control.deactivate();
				}
				var targetControl=me.map.getControlsBy("ControlId",ControlId)[0];
				targetControl.activate();
			}
		},
		GetLayerAjax:function(url,layerName){
			var Layer=new OpenLayers.Layer.Vector(layerName);
				$.ajax(
					{
						url:url,
						dataType:"text",
						success:function(d){
							var format=new OpenLayers.Format.GeoJSON();
							var temFeatures=format.read(d);
							Layer.addFeatures(temFeatures);
						}
					}
				);
				return Layer;
		},
		SetLayerVisibleAllForSingle:function(layerName,visable){
			var me=this;
			var layers=me.map.layers;
			for(var i=0;i<layers.length;i++){
				var layer=layers[i];
				if(layer.isBaseLayer){
					continue;
				}
				if(layer.name==layerName){
					layer.setVisibility(visable);
					continue;
				}
				layer.setVisibility(!visable);
			}
		},
		ShowLayer:function(layerName){
			var me=this;
			var layer=me.map.getLayersByName(layerName)[0];
			layer.setVisibility(true);
		},
		GetLayerVisible:function(layerName){
			var me=this;
			var layer=me.map.getLayersByName(layerName);
			if(layer.length<1){
				return null;
			}
			else{
				return layer[0].getVisibility();
			}
		},
		InitHapsDataPanelEvent:function(){
			var me=this;

			$("#hapsdata_a").bind("click",function(){
				me.ShowSubMenu("hapsDataPanel");
				me.SetLayerVisibleAllForSingle("haps_data_layer",true);
				me.SetControlActivateAllForSingle("haps_selecter");
			});			
			$("#hapsDataPanel li").mouseenter(function(){
				$(this).addClass("hapsWarnTimeHover");
			});

			$("#hapsDataPanel li").mouseleave(function(){
				$(this).removeClass("hapsWarnTimeHover");
			});
			$("#hapsDataPanel li").click(function(){
				$("#hapsDataPanel li").removeClass("hapsWarnTimeSelect");
				$(this).addClass("hapsWarnTimeSelect");
				var tag=$(this).attr("tag");
				var hapsLayer=me.map.getLayersByName("haps_data_layer")[0];
				if(hapsLayer){
					me.map.removeLayer(hapsLayer);
				}				

				var newHapsLayer=me.GetLayerAjax("data/HapsGeoJson"+tag+".js","haps_data_layer");
				newHapsLayer.styleMap=me.HapsDataLayerStyle;
				me.map.addLayers([newHapsLayer]);
				var control=me.map.getControlsBy("ControlId","haps_selecter")[0];
				me.map.removeControl(control);
				me.InitHapsSelecter(true);
			});
			me.InitHapsSelecter(false);
		},
		InitHapsDataLayer:function(){
			var me=this;
			var HapsDataLayer=me.GetLayerAjax("data/HapsGeoJson0.js","haps_data_layer");			
			HapsDataLayer.styleMap=me.HapsDataLayerStyle;
			HapsDataLayer.setVisibility(false);
			me.map.addLayers([HapsDataLayer]);
		},
		InitParameter:function(){

				this.MonitorLayerStyle= new OpenLayers.StyleMap({
					"default":new OpenLayers.Style({
								pointRadius:2,
								fillColor: "#ff9933",
								strokeColor: "white",
								strokeWidth: 1,
								label:'${r05m}',
								labelXOffset: "-15",
								labelYOffset: "15"
						},
						{
						rules: [
								new OpenLayers.Rule({
									filter: new OpenLayers.Filter.Comparison({
										type: OpenLayers.Filter.Comparison.GREATER_THAN ,
										property: "r05m",
										value:30
									}),
									symbolizer: {
										 graphicWidth: 20,
										 graphicHeight: 20,
										 externalGraphic: "images/Warning.gif",
										 label:'${r05m}',
										labelXOffset: "-15",
										labelYOffset: "15"
									}
								}),
								new OpenLayers.Rule({
									// apply this rule if no others apply
									elseFilter: true,
									symbolizer: {
										pointRadius:2,
										fillColor: "#ff9933",
										strokeColor: "white",
										strokeWidth: 1
									}
								})
							]
						}			
					)
			});
		this.WeatherWarnLayerStyle= new OpenLayers.StyleMap({
					"default":new OpenLayers.Style({
							fillColor: "#ffcc66",
							strokeColor: "white",
							fillOpacity: 0.7,
							strokeOpacity:1
						},
						{
							rules: [
								new OpenLayers.Rule({
									filter: new OpenLayers.Filter.Comparison({
										type: OpenLayers.Filter.Comparison.EQUAL_TO,
										property: "color", 
										value: "1"
									}),
									symbolizer: {
										fillColor: "white"									
									}
								}),
								new OpenLayers.Rule({
									filter: new OpenLayers.Filter.Comparison({
										type: OpenLayers.Filter.Comparison.EQUAL_TO,
										property: "color", 
										value: "2"
									}),
									symbolizer: {
										fillColor: "blue"									
									}
								}),
								new OpenLayers.Rule({
									filter: new OpenLayers.Filter.Comparison({
										type: OpenLayers.Filter.Comparison.EQUAL_TO,
										property: "color", 
										value: "3"
									}),
									symbolizer: {
										fillColor: "yellow"									
									}
								}),
								new OpenLayers.Rule({
									filter: new OpenLayers.Filter.Comparison({
										type: OpenLayers.Filter.Comparison.EQUAL_TO,
										property: "color", 
										value: "4"
									}),
									symbolizer: {
										fillColor: "orange"									
									}
								}),
								new OpenLayers.Rule({
									filter: new OpenLayers.Filter.Comparison({
										type: OpenLayers.Filter.Comparison.EQUAL_TO,
										property: "color", 
										value: "5"
									}),
									symbolizer: {
										fillColor: "red"									
									}
								})
							]
						}					
					)
			});
			this.HapsDataLayerStyle= new OpenLayers.StyleMap({
							"default":new OpenLayers.Style({
									fillColor: "#ffcc66",
									strokeColor: "white",
									fillOpacity: 0.7,
									strokeOpacity:1
								},
								{
									rules: [
										new OpenLayers.Rule({
											filter: new OpenLayers.Filter.Comparison({
												type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
												property: "r", 
												value: "30"
											}),
											symbolizer: {
												fillColor: "red"									
											}
										}),
										new OpenLayers.Rule({
											elseFilter: true,
											symbolizer: {
												fillColor: "#ffcc66",
												strokeColor: "white",
												fillOpacity: 0.7,
												strokeOpacity:1
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
