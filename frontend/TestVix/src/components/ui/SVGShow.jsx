// import React from 'react'
import { Excalidraw } from "@excalidraw/excalidraw";
import { exportToSvg } from "@excalidraw/utils";
import { useEffect, useRef, useState } from "react";

import "@excalidraw/excalidraw/index.css";


export const renderSvg = async ({json, setSVG}) => {
        try {
          const parsed = JSON.parse(json);
    
          const svgEl = await exportToSvg({
            elements: parsed.elements || [],
            appState: {
              exportBackground: true,
            },
            files: {},
          });
    
          setSVG(svgEl.outerHTML);
        } catch (err) {
          console.error(err);
          alert("JSON noto'g'ri");
        }
      };


export default function SVGShow({svg, setSVG, json}) {
  useEffect(() => {
    
    if(json){
      setTimeout(() => {
        renderSvg({json, setSVG});
      }, 100);
    }
  }, [json]);
    
  return (
    <div
        style={{
          background: "#fff",
          overflow: "auto",
          padding: 20,
        }}
        dangerouslySetInnerHTML={{
          __html: svg,
        }}
      />
  )
}
