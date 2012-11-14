<?xml version="1.0" encoding="UTF-8"?>
<sld:StyledLayerDescriptor version="1.0.0" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
	<sld:NamedLayer>
		<sld:Name>railwayBuff</sld:Name>
		<sld:UserStyle>
			<sld:Name>railway buff</sld:Name>
			<sld:Title/>
			<sld:FeatureTypeStyle>
				<sld:Name>group 0</sld:Name>
				<sld:FeatureTypeName>Feature</sld:FeatureTypeName>
				<sld:SemanticTypeIdentifier>generic:geometry</sld:SemanticTypeIdentifier>
				<sld:SemanticTypeIdentifier>simple</sld:SemanticTypeIdentifier>
				<sld:Rule>
					<sld:Name>default rule</sld:Name>
					<sld:PolygonSymbolizer>
						<sld:Fill>
							<sld:CssParameter name="fill">#FFFFFF</sld:CssParameter>
							<sld:CssParameter name="fill-opacity">0.5</sld:CssParameter>
						</sld:Fill>
						<sld:Stroke>
							<sld:CssParameter name="stroke">#000000</sld:CssParameter>
							<sld:CssParameter name="stroke-linecap">round</sld:CssParameter>
							<sld:CssParameter name="stroke-linejoin">round</sld:CssParameter>
							<sld:CssParameter name="stroke-dasharray">5.0</sld:CssParameter>
						</sld:Stroke>
					</sld:PolygonSymbolizer>
				</sld:Rule>
			</sld:FeatureTypeStyle>
		</sld:UserStyle>
	</sld:NamedLayer>
</sld:StyledLayerDescriptor>


