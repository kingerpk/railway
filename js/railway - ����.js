			var charDatas=new Array();//自动站数据
			var selectWeaterID; //被选择的自动站id，用于地图气泡中tab切换时，数据的加载
			var mapPanel; //GeoExt中的mapPanel控件
			var layer;//底图图层
			var graphicsLayer; //自动站图层
			var graphicsLayer_yxcs; //铁路沿线城市图层，该图层展示面雨量信息
			var graphicsLayer_qsjb; //全省预警图层
			var graphicsLayer_warning; //雨量预警图层
			var railwayLayer; //铁路图层			
			var map;   //openlayer的map对象
		
			var panel; //地图上的预警图标面板
			var mapPopup;  //地图气泡
			var railwayBuffer20; //铁路20公里缓冲区
			var railwayBuffer30;
			var railwayBuffer50;
			
			var plot1; //jqplot图表对象
			var leftPanel; //ext的左边栏
			
			var localhost="http://localhost:8080/geoserver1";
			var remotehost="http://58.215.188.217:8080/geoserver";
			var host=remotehost;
			var ncmwsHose="http://localhost:8080/ncwms";

			//地图的边界
			var bounds = new OpenLayers.Bounds(
				109.50547790527348, 19.70167516997612,
				117.97979381858295, 26.138117190747103
			);
			
			$(document).ready(
				function(){		
							OpenLayers.ProxyHost='../cgi/proxy.cgi?url=';
							/*
								初始化图表需要的数据
								MonitorHour存放于‘data/MonitorHour.js’
								是自动站的模拟数据
							*/
							var stationA=MonitorHour[0];
							var stationB=MonitorHour[1];
							var stationC=MonitorHour[2];
							
							var rhdataA={r:new Array(),u:new Array()};
							var rhdataB={r:new Array(),u:new Array()};
							var rhdataC={r:new Array(),u:new Array()};
							
							
							
							for(var i in stationA){
								rhdataA.r.push(stationA[i].rh);
								rhdataB.r.push(stationB[i].rh);
								rhdataC.r.push(stationC[i].rh);
								rhdataA.u.push(stationA[i].t);
								rhdataB.u.push(stationB[i].t);
								rhdataC.u.push(stationC[i].t);
							}
							
							charDatas.push(rhdataA);
							charDatas.push(rhdataB);
							charDatas.push(rhdataC);
							
							
							//地图的初始化参数
							var options = {
								projection: new OpenLayers.Projection("EPSG:4326"),
								units: "degrees",
								numZoomLevels: 10, 
								maxExtent:bounds,
								controls: [],
								fractionalZoom: true
							};
							//初始化地图对象
							map = new OpenLayers.Map("mapDiv",options);
							
							//加载底图图层
							layer = new OpenLayers.Layer.WMS(
								"Global Imagery",
								host+"/cite/wms?service=WMS",
								 {layers: "railway1"},
								 {singleTile:true}
							);
							
							
							
							//加载铁路图层
							railwayLayer = new OpenLayers.Layer.WMS(
								"Global Imagery",
								host+"/wms?service=WMS",
								 {layers: "cite:railway", format:'image/gif',transparent: "true"}
							);
							
							//初始化三个对应的铁路缓冲区
							railwayBuffer20=  new OpenLayers.Layer.Vector("railwayBuffer20");	
							//加载三个对应的铁路缓冲区图层
							myopenayer.getFeatureToVector(host+"/cite/ows",'cite:railway_buff20',railwayBuffer20,bounds);
							//加载sld文件，为缓冲区设置风格
							OpenLayers.Request.GET({
							url: "data/railwayBuff.sld",
							success: function(req){
								 var format = new OpenLayers.Format.SLD();
								 var sld = format.read(req.responseXML || req.responseText);
								 var style=sld.namedLayers['railwayBuff'].userStyles[0];
								 var styleMap= new OpenLayers.StyleMap({"default":style});
								 railwayBuffer20.styleMap=styleMap;
							}
						});
							
							//初始化自动站图层
							graphicsLayer =new OpenLayers.Layer.Vector("Points", {
								styleMap: new OpenLayers.StyleMap({
										"default":new OpenLayers.Style({
													pointRadius:6,
													fillColor: "#ff9933",
													strokeColor: "white",
													strokeWidth: 2,
													label:'${u}',
													labelXOffset: "-15",
													labelYOffset: "15"
												}),	
										"select": new OpenLayers.Style({
													fillColor: "#66ccff",
													strokeColor: "#3399ff",
													graphicZIndex: 2
												})
								})
							});
							//加载自动站图层
							myopenayer.getFeatureToVector(host+"/cite/ows",'cite:weater',graphicsLayer,bounds);
							
							graphicsLayer_warning=new OpenLayers.Layer.Vector("warning", {
								styleMap: new OpenLayers.StyleMap({
										"default":new OpenLayers.Style({
													 graphicWidth: 20,
													 graphicHeight: 20,
													 externalGraphic: "images/Warning.gif"
												})
								})
							});
							
							//初始化铁路沿线图层，其中参数中的rule根据雨量信息进行分级显示的规则
							graphicsLayer_yxcs =new OpenLayers.Layer.Vector("yxcs", {
								styleMap: new OpenLayers.StyleMap({
										"default":new OpenLayers.Style({
										fillColor: "#ffcc66",
										strokeColor: "white",
										fillOpacity: 0.3,
										strokeOpacity:0.3
													//label:'${NAME99}'
											},
										{
											rules: [
												new OpenLayers.Rule({
													// a rule contains an optional filter
													filter: new OpenLayers.Filter.Comparison({
														type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
														property: "rl", // the "foo" feature attribute
														value: 7
													}),
													// if a feature matches the above filter, use this symbolizer
													symbolizer: {
														fillColor: "red"
														
													}
												}),
												new OpenLayers.Rule({
													filter: new OpenLayers.Filter.Comparison({
														type: OpenLayers.Filter.Comparison.BETWEEN,
														property: "rl",
														lowerBoundary: 4,
														upperBoundary: 7
													}),
													symbolizer: {
														fillColor: "#FF8040"
													}
												}),
												new OpenLayers.Rule({
													filter: new OpenLayers.Filter.Comparison({
														type: OpenLayers.Filter.Comparison.BETWEEN,
														property: "rl",
														lowerBoundary: 0,
														upperBoundary: 4
													}),
													symbolizer: {
														fillColor: "#FFFF00"
													}
												}),
												new OpenLayers.Rule({
													// apply this rule if no others apply
													elseFilter: true,
													symbolizer: {
														fillColor: "#CCCC99"
													}
												})
											]
										}
										
										)
								})
							}
							);
							//加载沿线城市图层
							
							//初始化全省预警图层
							graphicsLayer_qsjb=new OpenLayers.Layer.Vector("xianjie", {
								styleMap: new OpenLayers.StyleMap({
										"default":new OpenLayers.Style({
										fillColor: "#ffcc66",
										strokeColor: "white",
										fillOpacity: 0.7,
										strokeOpacity:1
													//label:'${NAME99}'
											},
										{
											rules: [
												new OpenLayers.Rule({
													// a rule contains an optional filter
													filter: new OpenLayers.Filter.Comparison({
														type: OpenLayers.Filter.Comparison.EQUAL_TO,
														property: "jb", // the "foo" feature attribute
														value: 1
													}),
													// if a feature matches the above filter, use this symbolizer
													symbolizer: {
														fillColor: "#0E0CE9"
														
													}
												}),
												new OpenLayers.Rule({
													filter: new OpenLayers.Filter.Comparison({
														type: OpenLayers.Filter.Comparison.EQUAL_TO,
														property: "jb",
														value: 2
													}),
													symbolizer: {
														fillColor: "#FF8040"
													}
												}),
												new OpenLayers.Rule({
													filter: new OpenLayers.Filter.Comparison({
														type: OpenLayers.Filter.Comparison.EQUAL_TO,
														property: "jb",
														value: 3
													}),
													symbolizer: {
														fillColor: "#C0B84D"
													}
												}),
												new OpenLayers.Rule({
													// apply this rule if no others apply
													elseFilter: true,
													symbolizer: {
														fillColor: "#D4D4D4"
														
													}
												})
											]
										}
										
										)
								})
							}
							);
							
							//鼠标位置control，用于显示当前鼠标位置的经纬度的插件
							var mouseP=new OpenLayers.Control.MousePosition();
							mouseP.displayProjection=new OpenLayers.Projection(4326);
							
							//初始化自动站的选择器，在选择其中绑定自定义函数，用于选择自动站时弹出地图气泡
							 map.addControl( new OpenLayers.Control.LoadingPanel());
							
							//将上面初始化的一系列图层和control添加到map中去
							map.addLayer(layer);					
							map.addLayer(graphicsLayer_yxcs);
							map.addLayer(graphicsLayer);
							map.addLayer(graphicsLayer_warning);
							map.addLayer(graphicsLayer_qsjb);
							map.addLayer(railwayBuffer20);
							//map.addLayer(railwayLayer);
							
							
							map.addControl(mouseP);
							map.addControls([
								new OpenLayers.Control.Navigation(),
								new OpenLayers.Control.Attribution(),
								new OpenLayers.Control.PanZoomBar()
							]);
							map.projection="EPSG:4326";
							map.units='degrees';
							mouseP.activate();
								
							map.zoomToMaxExtent();
							
							//控制几个特殊图层的可见性							
							map.setCenter(new OpenLayers.LonLat(113.62678, 23.44851), 3);
				});
				
			function showMianYuLiang(){
				graphicsLayer_qsjb.removeAllFeatures();
				if(graphicsLayer_yxcs.visibility||graphicsLayer_warning.visibility){						
					graphicsLayer_yxcs.removeAllFeatures();
					graphicsLayer_warning.removeAllFeatures();
					return;
				}
				
				OpenLayers.Request.GET({
										url: host+"/cite/ows",
										params: { REQUEST: "GetFeature",
													BBOX: bounds.toBBOX(),   
													outputFormat:'json',
													maxFeatures:'50',
													srsName: 'EPSG:4326',
													service: 'WFS',
													version: '1.0.0', 
													typeName:'cite:tlyx_'      
												},
										callback: function(data){
											var jsonFormat=new OpenLayers.Format.GeoJSON();
											var graphicsResults=jsonFormat.read(data.responseText);
											
											for(var i=0;i<graphicsResults.length;i++){
												var feature = graphicsResults[i];							
												var vector=new OpenLayers.Feature.Vector();									
												vector.geometry=feature.geometry;
												vector.attributes=feature.attributes;	
												vector.attributes.rl=rl[vector.attributes.BOUNT_ID];
												graphicsLayer_yxcs.addFeatures(vector);		
												
												if(vector.attributes.rl>7){
													var b=feature.geometry.getBounds();
													var center=b.getCenterLonLat();
													var point = new OpenLayers.Geometry.Point(center.lon,center.lat);
													var vector=new OpenLayers.Feature.Vector();
													vector.geometry=point;
													graphicsLayer_warning.addFeatures(vector);
												}
											}
										}
									});			
				
				graphicsLayer_yxcs.redraw();
				graphicsLayer_warning.redraw();
				map.pan(1,1,null);//为了马上显示出效果，土办法
			}
			
			function showleidatu(){
				var boxx="104.0951,17.234114484031,120.78096004728,30.269942645969";
				 var giflayer=map.getLayersByName("nc");
				 if(giflayer.length>0){
					 for(var i in giflayer){
						 map.removeLayer(giflayer[i]);
					 }
					 return;
				 }
				 
				 var width=parseInt($("#mapDiv").css("width"));
				 var height=parseInt($("#mapDiv").css("height"));
				
				var nc=new OpenLayers.Layer.Image(
						"nc",
						"images/5.gif",
						new OpenLayers.Bounds(104.09032306619591,17.207625610448765,120.78255097474292,30.54637790634074),
						new OpenLayers.Size(width,height),
						{ // Other options
		                    isBaseLayer : false,
		                    maxResolution: map.baseLayer.maxResolution,
		                    minResolution: map.baseLayer.minResolution,
		                    resolutions: map.baseLayer.resolutions
		                }
				);
				map.addLayer(nc);
			}
			
			function showleidatu1(){
				var boxx="104.0951,17.234114484031,120.78096004728,30.269942645969";
				 var giflayer=map.getLayersByName("nc");
				 if(giflayer.length>0){
					 for(var i in giflayer){
						 map.removeLayer(giflayer[i]);
					 }
					 return;
				 }
				 var box=map.getExtent().toBBOX();
				 var width=parseInt($("#mapDiv").css("width"));
				 var height=parseInt($("#mapDiv").css("height"));
				 var params = {
							layers: "gis23/pr",//"gis2/CANWAT"，选择的属性
							elevation: 0,//这里好像是0
							time: "2012-07-23T00:00:00.000Z/2012-07-23T23:00:00.000Z",//"2012-08-01T17:00:00.000Z",也就是选择的时间参数
							transparent: 'true',
							styles: "boxfill/rainbow", //"boxfill/rainbow"，也就是上面paletteName这个参数
							// Removed this because it is no longer needed (OpenLayers takes care of it)
							//crs: map.baseLayer.projection,
							colorscalerange: "0.1,47.82",//上面也有提到这两个参数
							numcolorbands: 254,//应该是上面的numBands参数
							logscale: false,//false
							FORMAT:"image/gif",
							BBOX:boxx,//这个是数据范围
							width:width,
							height:height,
							SERVICE:'WMS',
							VERSION:'1.1.1',
							REQUEST:'GetMap',
							EXCEPTIONS:'application/vnd.ogc.se_inimage',
							SRS:'EPSG:4326',
							D_ALPHA:255,
							B_ALPHA:0,
							O_ALPHA:0
						};
				var gifUrl=ncmwsHose+"/wms?";
				for(var i in params){
					gifUrl=gifUrl+i.toUpperCase()+"="+params[i]+"&"
				}
				var nc=new OpenLayers.Layer.Image(
						"nc",
						gifUrl,
						new OpenLayers.Bounds(104.0951,17.234114484031,120.78096004728,30.269942645969),
						new OpenLayers.Size(width,height),
						{ // Other options
		                    isBaseLayer : false,
		                    maxResolution: map.baseLayer.maxResolution,
		                    minResolution: map.baseLayer.minResolution,
		                    resolutions: map.baseLayer.resolutions
		                }
				);
				map.addLayer(nc);
				/*var nc = new OpenLayers.Layer.WMS( "OpenLayers WMS",
				"http://localhost:8080/ncwms/wms", params,
				{buffer: 1, wrapDateLine: true});
				map.addLayer(nc);*/
			}
			
			function showQuanshengYujing(){
					graphicsLayer_yxcs.removeAllFeatures();
					graphicsLayer_warning.removeAllFeatures();
					if(graphicsLayer_qsjb.visibility){						
						graphicsLayer_qsjb.removeAllFeatures();
						return;
					}
					
					myopenayer.getFeatureToVector(host+"/cite/ows",'cite:xianjie',graphicsLayer_qsjb,bounds);
					graphicsLayer_qsjb.redraw();
					
					map.pan(1,1,null);//为了马上显示出效果，土办法
				var isOn=$("#warnList").css("display");
				if(isOn=="none"){					
					$("#warnList").css("display","block");
					//预警图标的效果
				 
				 	$("#MyMapPanel li").mouseover(
						function(){
							$(this).css("background","#BFDDAE"); 
						}
					);
					$("#MyMapPanel li").mouseout(
						function(){
							$(this).css("background",""); 
						}
					);
				
				}
				else{
					map.removeControl(panel);
					$("#warnList").css("display","none");
					
				}
				
			}