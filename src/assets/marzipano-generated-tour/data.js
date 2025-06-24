var APP_DATA = {
  "scenes": [
    {
      "id": "0-escena_1",
      "name": "escena_1",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3000,
      "initialViewParameters": {
        "yaw": 0.7680314150662966,
        "pitch": 0.07238262284744224,
        "fov": 1.325599857056214
      },
      "linkHotspots": [
        {
          "yaw": -0.38462130926420457,
          "pitch": 0.12495310863256748,
          "rotation": 13.351768777756625,
          "target": "1-escena_2"
        }
      ],
      "infoHotspots": [
        {
          "yaw": 1.1131538383034538,
          "pitch": 0.08906882219207546,
          "title": "Ciudad Nevada",
          "text": "Estamos en una ciudad muy nevada, una puesta de sol impresionante y un panorama hermoso."
        }
      ]
    },
    {
      "id": "1-escena_2",
      "name": "escena_2",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3000,
      "initialViewParameters": {
        "yaw": -2.908202449069993,
        "pitch": 0.1458017657845634,
        "fov": 1.325599857056214
      },
      "linkHotspots": [
        {
          "yaw": -2.7626121950806635,
          "pitch": 0.12760609807674506,
          "rotation": 4.71238898038469,
          "target": "2-escena_3"
        }
      ],
      "infoHotspots": [
        {
          "yaw": 2.29158583131335,
          "pitch": -0.07583662611874686,
          "title": "Ciudad Ambiental",
          "text": "Una ciudad con muchas montañas a su alrededor, en este caso no esta nevada y nos deja ver totalmente su majestuosidad,"
        }
      ]
    },
    {
      "id": "2-escena_3",
      "name": "escena_3",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1344,
      "initialViewParameters": {
        "yaw": -2.0924068170731225,
        "pitch": -0.25045267553284134,
        "fov": 1.325599857056214
      },
      "linkHotspots": [
        {
          "yaw": 0.8621404161491419,
          "pitch": -0.6913020807448689,
          "rotation": 3.141592653589793,
          "target": "0-escena_1"
        }
      ],
      "infoHotspots": [
        {
          "yaw": -1.371754272487923,
          "pitch": 0.12734194019875034,
          "title": "Lago Azul",
          "text": "Para terninar un lago con un espejo natural impresionante."
        }
      ]
    }
  ],
  "name": "Prueba_tour_web",
  "settings": {
    "mouseViewMode": "drag",
    "autorotateEnabled": true,
    "fullscreenButton": true,
    "viewControlButtons": true
  }
};
