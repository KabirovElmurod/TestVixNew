import { Excalidraw } from "@excalidraw/excalidraw";
import { exportToSvg } from "@excalidraw/utils";
import { useEffect, useRef, useState } from "react";

import "@excalidraw/excalidraw/index.css";

export default function Draw1() {
  const apiRef = useRef(null);

  const [json, setJson] = useState(JSON.stringify(
    {
  "elements": [
    {
      "id": "eYY1IqtvASmMxHrhK9OKN",
      "type": "arrow",
      "x": 149.60000610351562,
      "y": 173,
      "width": 163.20001220703125,
      "height": 73.60000610351562,
      "angle": 0,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "index": "a0",
      "roundness": {
        "type": 2
      },
      "seed": 907590897,
      "version": 8,
      "versionNonce": 372128881,
      "isDeleted": false,
      "boundElements": null,
      "updated": 1781629871866,
      "link": null,
      "locked": false,
      "points": [
        [
          0,
          0
        ],
        [
          163.20001220703125,
          73.60000610351562
        ]
      ],
      "lastCommittedPoint": null,
      "startBinding": null,
      "endBinding": null,
      "startArrowhead": null,
      "endArrowhead": "arrow",
      "elbowed": false
    },
    {
      "id": "hXZJuMByCop9v7clLQNWM",
      "type": "line",
      "x": 133.60000610351562,
      "y": 326.6000061035156,
      "width": 115.20001220703125,
      "height": 160.8000030517578,
      "angle": 0,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "index": "a1",
      "roundness": {
        "type": 2
      },
      "seed": 2062517841,
      "version": 8,
      "versionNonce": 1344624081,
      "isDeleted": false,
      "boundElements": null,
      "updated": 1781629873465,
      "link": null,
      "locked": false,
      "points": [
        [
          0,
          0
        ],
        [
          115.20001220703125,
          -160.8000030517578
        ]
      ],
      "lastCommittedPoint": null,
      "startBinding": null,
      "endBinding": null,
      "startArrowhead": null,
      "endArrowhead": null
    },
    {
      "id": "K9OsgQL9jZtm_eJfsUprB",
      "type": "line",
      "x": 316,
      "y": 129,
      "width": 36,
      "height": 133.60000610351562,
      "angle": 0,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "index": "a2",
      "roundness": {
        "type": 2
      },
      "seed": 226259889,
      "version": 7,
      "versionNonce": 1129911359,
      "isDeleted": false,
      "boundElements": null,
      "updated": 1781629876632,
      "link": null,
      "locked": false,
      "points": [
        [
          0,
          0
        ],
        [
          36,
          133.60000610351562
        ]
      ],
      "lastCommittedPoint": null,
      "startBinding": null,
      "endBinding": null,
      "startArrowhead": null,
      "endArrowhead": null
    }
  ]
}
  ));
  const [svg, setSvg] = useState("");

  

  // Canvas -> JSON
  const getJson = () => {
    if (!apiRef.current) return;

    const elements = apiRef.current.getSceneElements();

    setJson(
      JSON.stringify(
        {
          elements,
        },
        null,
        2
      )
    );
  };
  useEffect(() => {
    loadJsonToCanvas();
  }, [])
  // JSON -> Canvas
  const loadJsonToCanvas = (api) => {
  try {
    const parsed = JSON.parse(json);
    console.log('a');
    
    if (!api) return;
    console.log('b');
    if (!apiRef.current) return;
    console.log('c');
    console.log(apiRef.current);
    setTimeout(() => {
      apiRef.current.updateScene({
      elements: parsed.elements || [],
    });
    }, 1000);
    
    
    // (api || apiRef.current)?apiRef.current:'sa' .updateScene({
    //   elements: parsed.elements || [],
    // });
  } catch (err) {
    console.error(err);
  }
};

  // JSON -> SVG
  const renderSvg = async () => {
    try {
      const parsed = JSON.parse(json);

      const svgEl = await exportToSvg({
        elements: parsed.elements || [],
        appState: {
          exportBackground: true,
        },
        files: {},
      });

      setSvg(svgEl.outerHTML);
    } catch (err) {
      console.error(err);
      alert("JSON noto'g'ri");
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 400px 1fr",
        height: "100vh",
      }}
    >
      {/* DRAW AREA */}
      <div>
        <Excalidraw
          excalidrawAPI={(api) => {
            apiRef.current = api;
            // loadJsonToCanvas(api);
          }}
          UIOptions={{
            canvasActions: {
              loadScene: false,
              export: false,
              saveAsImage: false,
            },
            tools: {
              image: false,
            },
          }}
        />
      </div>

      {/* JSON PANEL */}
      {/* <div
        style={{
          padding: 12,
          borderLeft: "1px solid #ddd",
          borderRight: "1px solid #ddd",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <button onClick={getJson}>GET JSON</button>

          <button onClick={loadJsonToCanvas}>
            LOAD JSON
          </button>

          <button onClick={renderSvg}>
            RENDER SVG
          </button>
        </div>

        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          style={{
            width: "100%",
            height: "calc(100vh - 80px)",
            fontSize: 12,
            fontFamily: "monospace",
          }}
        />
      </div> */}

      {/* SVG PREVIEW */}
      {/* <div
        style={{
          background: "#fff",
          overflow: "auto",
          padding: 20,
        }}
        dangerouslySetInnerHTML={{
          __html: svg,
        }}
      /> */}
    </div>
  );
}