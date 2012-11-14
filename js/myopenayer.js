var myopenayer={
	getFeatureToVector:function(server_url,layername,TriggerVector,bound){
		OpenLayers.Request.GET({
							url: server_url,
							params: { REQUEST: "GetFeature",
										BBOX: bound.toBBOX(),   
										outputFormat:'json',
										maxFeatures:'100',
										srsName: 'EPSG:4326',
										service: 'WFS',
										version: '1.0.0', 
										typeName:layername     
									},
							callback: function(data){
								var jsonFormat=new OpenLayers.Format.GeoJSON();
								var graphicsResults=jsonFormat.read(data.responseText);
								
								for(var i=0;i<graphicsResults.length;i++){
									var feature = graphicsResults[i];							
									var vector=new OpenLayers.Feature.Vector();									
									vector.geometry=feature.geometry;
									vector.attributes=feature.attributes;
									TriggerVector.addFeatures(vector);	
								}
								
							}
						});
	}
}