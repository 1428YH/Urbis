initMap();

async function initMap() {
    await ymaps3.ready;
    ymaps3.import.registerCdn(
        'https://cdn.jsdelivr.net/npm/{package}',
        '@yandex/ymaps3-default-ui-theme@0.0.19'
    );
    const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = ymaps3;

    const map = new YMap(document.getElementById('map'), {
        location: {
            center: [30.3609, 59.9311],
            zoom: 10,
        }
    });

    map.addChild(new YMapDefaultSchemeLayer());
    const featuresLayer = map.addChild(new YMapDefaultFeaturesLayer());
    const uiTheme = await ymaps3.import('@yandex/ymaps3-default-ui-theme');
    const { YMapDefaultMarker } = uiTheme;

    const marker = new YMapDefaultMarker({
        coordinates: [30.3609, 59.9311],
        color: "red",
        title: "Пожар!",
        subtitle: 'kind and bright',
    })

    featuresLayer.addChild(marker);
}